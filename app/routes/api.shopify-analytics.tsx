import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

// API endpoint to fetch Shopify analytics data
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { admin } = await authenticate.admin(request);
    const url = new URL(request.url);
    const period = url.searchParams.get("period") || "30d";
    
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const startDateISO = startDate.toISOString();

    // Fetch orders for the period
    const ordersQuery = `
      query getOrders($first: Int!, $query: String) {
        orders(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              financialStatus
              fulfillmentStatus
              customer {
                id
                firstName
                lastName
                email
              }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    variantTitle
                    quantity
                    originalUnitPriceSet {
                      shopMoney {
                        amount
                      }
                    }
                    product {
                      id
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const ordersResponse = await admin.graphql(ordersQuery, {
      variables: {
        first: 250,
        query: `created_at:>=${startDateISO}`
      }
    });
    const ordersData = await ordersResponse.json();

    // Fetch customers
    const customersQuery = `
      query getCustomers($first: Int!) {
        customers(first: $first, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              firstName
              lastName
              email
              createdAt
              orders(first: 10) {
                edges {
                  node {
                    id
                    name
                    createdAt
                    totalPriceSet {
                      shopMoney {
                        amount
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const customersResponse = await admin.graphql(customersQuery, {
      variables: { first: 250 }
    });
    const customersData = await customersResponse.json();

    // Fetch products
    const productsQuery = `
      query getProducts($first: Int!) {
        products(first: $first, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              title
              productType
              vendor
              totalInventory
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    inventoryQuantity
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    `;

    const productsResponse = await admin.graphql(productsQuery, {
      variables: { first: 250 }
    });
    const productsData = await productsResponse.json();

    if (ordersData.errors || customersData.errors || productsData.errors) {
      console.error("GraphQL errors:", { ordersData, customersData, productsData });
      throw new Error("Failed to fetch analytics data from Shopify");
    }

    // Process orders data
    const orders = ordersData.data.orders.edges.map((edge: any) => edge.node);
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, order: any) => {
      return sum + parseFloat(order.totalPriceSet.shopMoney.amount);
    }, 0);

    // Process customers data
    const customers = customersData.data.customers.edges.map((edge: any) => edge.node);
    const uniqueCustomers = customers.length;

    // Calculate customer statistics
    const customerStats = customers.map((customer: any) => {
      const customerOrders = customer.orders.edges.map((orderEdge: any) => orderEdge.node);
      const totalSpent = customerOrders.reduce((sum: number, order: any) => {
        return sum + parseFloat(order.totalPriceSet.shopMoney.amount);
      }, 0);
      
      return {
        id: customer.id.replace('gid://shopify/Customer/', ''),
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        totalOrders: customerOrders.length,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        averageOrderValue: customerOrders.length > 0 ? parseFloat((totalSpent / customerOrders.length).toFixed(2)) : 0
      };
    });

    // Process products data
    const products = productsData.data.products.edges.map((edge: any) => edge.node);
    const totalProducts = products.length;
    const totalInventory = products.reduce((sum: number, product: any) => {
      return sum + product.totalInventory;
    }, 0);

    // Calculate size distribution from orders (if we can identify size-related products)
    const sizeDistribution: { [key: string]: number } = {};
    orders.forEach((order: any) => {
      order.lineItems.edges.forEach((itemEdge: any) => {
        const item = itemEdge.node;
        // Look for size information in variant title
        if (item.variantTitle && /^(XS|S|M|L|XL|XXL)$/i.test(item.variantTitle)) {
          const size = item.variantTitle.toUpperCase();
          sizeDistribution[size] = (sizeDistribution[size] || 0) + item.quantity;
        }
      });
    });

    // Convert size distribution to array format
    const sizeDistributionArray = Object.keys(sizeDistribution).map(size => ({
      size,
      recommendations: sizeDistribution[size],
      percentage: totalOrders > 0 ? ((sizeDistribution[size] / totalOrders) * 100).toFixed(1) : '0.0',
      avgBust: '34.0', // Default values - could be calculated from product data
      avgWaist: '28.0',
      avgHip: '36.0',
      priority: sizeDistribution[size] > 2 ? 'HIGH' : 'MEDIUM'
    })).sort((a, b) => b.recommendations - a.recommendations);

    // Calculate status distribution
    const statusDistribution: { [key: string]: number } = {};
    orders.forEach((order: any) => {
      statusDistribution[order.fulfillmentStatus] = (statusDistribution[order.fulfillmentStatus] || 0) + 1;
    });

    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOrders = orders.filter((order: any) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= sevenDaysAgo;
    });

    const recentRevenue = recentOrders.reduce((sum: number, order: any) => {
      return sum + parseFloat(order.totalPriceSet.shopMoney.amount);
    }, 0);

    // Top customers by total spent
    const topCustomers = customerStats
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    // Top products by inventory
    const topProducts = products
      .sort((a, b) => b.totalInventory - a.totalInventory)
      .slice(0, 5)
      .map(product => ({
        id: product.id.replace('gid://shopify/Product/', ''),
        title: product.title,
        productType: product.productType,
        vendor: product.vendor,
        totalInventory: product.totalInventory
      }));

    return new Response(JSON.stringify({
      success: true,
      data: {
        summary: {
          totalOrders,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          uniqueCustomers,
          averageOrderValue: totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0,
          totalProducts,
          totalInventory
        },
        sizeDistribution: sizeDistributionArray,
        sizeDistributionObject: sizeDistribution,
        statusDistribution,
        recentActivity: {
          orders: recentOrders.length,
          revenue: parseFloat(recentRevenue.toFixed(2))
        },
        topCustomers,
        topProducts,
        period,
        dateRange: {
          start: startDateISO,
          end: now.toISOString()
        }
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });

  } catch (error) {
    console.error("Error fetching Shopify analytics:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null
    }), { 
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};

// Handle OPTIONS for CORS
export const OPTIONS = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};
