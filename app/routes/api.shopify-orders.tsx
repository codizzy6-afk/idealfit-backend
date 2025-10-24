import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

// API endpoint to fetch Shopify orders
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { admin } = await authenticate.admin(request);
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const status = url.searchParams.get("status");
    const financialStatus = url.searchParams.get("financial_status");
    const fulfillmentStatus = url.searchParams.get("fulfillment_status");

    // Build GraphQL query
    let query = `
      query getOrders($first: Int!) {
        orders(first: $first, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              orderNumber
              createdAt
              updatedAt
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
                phone
                defaultAddress {
                  address1
                  address2
                  city
                  province
                  country
                  zip
                }
              }
              lineItems(first: 10) {
                edges {
                  node {
                    id
                    title
                    variantTitle
                    quantity
                    originalUnitPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    product {
                      id
                      title
                    }
                  }
                }
              }
              shippingAddress {
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
              billingAddress {
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
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    // Add filters if provided
    if (status || financialStatus || fulfillmentStatus) {
      query = `
        query getOrders($first: Int!, $query: String) {
          orders(first: $first, sortKey: CREATED_AT, reverse: true, query: $query) {
            edges {
              node {
                id
                name
                orderNumber
                createdAt
                updatedAt
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
                  phone
                  defaultAddress {
                    address1
                    address2
                    city
                    province
                    country
                    zip
                  }
                }
                lineItems(first: 10) {
                  edges {
                    node {
                      id
                      title
                      variantTitle
                      quantity
                      originalUnitPriceSet {
                        shopMoney {
                          amount
                          currencyCode
                        }
                      }
                      product {
                        id
                        title
                      }
                    }
                  }
                }
                shippingAddress {
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
                billingAddress {
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

    // Build query string for filters
    let queryString = "";
    if (status) queryString += `status:${status} `;
    if (financialStatus) queryString += `financial_status:${financialStatus} `;
    if (fulfillmentStatus) queryString += `fulfillment_status:${fulfillmentStatus} `;

    const variables: any = { first: limit };
    if (queryString) variables.query = queryString.trim();

    const response = await admin.graphql(query, { variables });
    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      throw new Error("Failed to fetch orders from Shopify");
    }

    // Transform Shopify data to our format
    const orders = data.data.orders.edges.map((edge: any) => {
      const order = edge.node;
      const customer = order.customer;
      const shippingAddress = order.shippingAddress;
      const billingAddress = order.billingAddress;

      return {
        id: order.id.replace('gid://shopify/Order/', ''),
        orderNumber: order.name,
        orderName: order.name,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        totalPrice: parseFloat(order.totalPriceSet.shopMoney.amount),
        currency: order.totalPriceSet.shopMoney.currencyCode,
        financialStatus: order.financialStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        customer: customer ? {
          id: customer.id.replace('gid://shopify/Customer/', ''),
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          address: customer.defaultAddress ? {
            address1: customer.defaultAddress.address1,
            address2: customer.defaultAddress.address2,
            city: customer.defaultAddress.city,
            province: customer.defaultAddress.province,
            country: customer.defaultAddress.country,
            zip: customer.defaultAddress.zip
          } : null
        } : null,
        shippingAddress: shippingAddress ? {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          phone: shippingAddress.phone,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2,
          city: shippingAddress.city,
          province: shippingAddress.province,
          country: shippingAddress.country,
          zip: shippingAddress.zip
        } : null,
        billingAddress: billingAddress ? {
          firstName: billingAddress.firstName,
          lastName: billingAddress.lastName,
          phone: billingAddress.phone,
          address1: billingAddress.address1,
          address2: billingAddress.address2,
          city: billingAddress.city,
          province: billingAddress.province,
          country: billingAddress.country,
          zip: billingAddress.zip
        } : null,
        lineItems: order.lineItems.edges.map((itemEdge: any) => {
          const item = itemEdge.node;
          return {
            id: item.id.replace('gid://shopify/LineItem/', ''),
            title: item.title,
            variantTitle: item.variantTitle,
            quantity: item.quantity,
            price: parseFloat(item.originalUnitPriceSet.shopMoney.amount),
            currency: item.originalUnitPriceSet.shopMoney.currencyCode,
            product: {
              id: item.product.id.replace('gid://shopify/Product/', ''),
              title: item.product.title
            }
          };
        })
      };
    });

    return new Response(JSON.stringify({
      success: true,
      data: orders,
      pagination: data.data.orders.pageInfo,
      total: orders.length
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
    console.error("Error fetching Shopify orders:", error);
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
