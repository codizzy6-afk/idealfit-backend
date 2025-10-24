import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

// API endpoint to fetch Shopify customers
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { admin } = await authenticate.admin(request);
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const search = url.searchParams.get("search");

    // Build GraphQL query
    let query = `
      query getCustomers($first: Int!) {
        customers(first: $first, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
              createdAt
              updatedAt
              defaultAddress {
                address1
                address2
                city
                province
                country
                zip
              }
              addresses(first: 5) {
                edges {
                  node {
                    id
                    address1
                    address2
                    city
                    province
                    country
                    zip
                    firstName
                    lastName
                    phone
                  }
                }
              }
              orders(first: 10, sortKey: CREATED_AT, reverse: true) {
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
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    // Add search filter if provided
    if (search) {
      query = `
        query getCustomers($first: Int!, $query: String) {
          customers(first: $first, sortKey: CREATED_AT, reverse: true, query: $query) {
            edges {
              node {
                id
                firstName
                lastName
                email
                phone
                createdAt
                updatedAt
                defaultAddress {
                  address1
                  address2
                  city
                  province
                  country
                  zip
                }
                addresses(first: 5) {
                  edges {
                    node {
                      id
                      address1
                      address2
                      city
                      province
                      country
                      zip
                      firstName
                      lastName
                      phone
                    }
                  }
                }
                orders(first: 10, sortKey: CREATED_AT, reverse: true) {
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
                    }
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
          }
        }
      `;
    }

    const variables: any = { first: limit };
    if (search) {
      variables.query = `first_name:*${search}* OR last_name:*${search}* OR email:*${search}*`;
    }

    const response = await admin.graphql(query, { variables });
    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      throw new Error("Failed to fetch customers from Shopify");
    }

    // Transform Shopify data to our format
    const customers = data.data.customers.edges.map((edge: any) => {
      const customer = edge.node;
      const orders = customer.orders.edges.map((orderEdge: any) => orderEdge.node);
      
      // Calculate customer statistics
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum: number, order: any) => {
        return sum + parseFloat(order.totalPriceSet.shopMoney.amount);
      }, 0);
      const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null;

      return {
        id: customer.id.replace('gid://shopify/Customer/', ''),
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        defaultAddress: customer.defaultAddress ? {
          address1: customer.defaultAddress.address1,
          address2: customer.defaultAddress.address2,
          city: customer.defaultAddress.city,
          province: customer.defaultAddress.province,
          country: customer.defaultAddress.country,
          zip: customer.defaultAddress.zip
        } : null,
        addresses: customer.addresses.edges.map((addrEdge: any) => {
          const addr = addrEdge.node;
          return {
            id: addr.id.replace('gid://shopify/MailingAddress/', ''),
            address1: addr.address1,
            address2: addr.address2,
            city: addr.city,
            province: addr.province,
            country: addr.country,
            zip: addr.zip,
            firstName: addr.firstName,
            lastName: addr.lastName,
            phone: addr.phone
          };
        }),
        orders: orders.map((order: any) => ({
          id: order.id.replace('gid://shopify/Order/', ''),
          name: order.name,
          createdAt: order.createdAt,
          totalPrice: parseFloat(order.totalPriceSet.shopMoney.amount),
          currency: order.totalPriceSet.shopMoney.currencyCode,
          financialStatus: order.financialStatus,
          fulfillmentStatus: order.fulfillmentStatus
        })),
        statistics: {
          totalOrders,
          totalSpent: parseFloat(totalSpent.toFixed(2)),
          lastOrderDate,
          averageOrderValue: totalOrders > 0 ? parseFloat((totalSpent / totalOrders).toFixed(2)) : 0
        }
      };
    });

    return new Response(JSON.stringify({
      success: true,
      data: customers,
      pagination: data.data.customers.pageInfo,
      total: customers.length
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
    console.error("Error fetching Shopify customers:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: []
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
