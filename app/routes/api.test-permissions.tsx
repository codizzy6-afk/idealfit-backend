import type { LoaderFunctionArgs } from "react-router";

// Test endpoint to verify Shopify access token permissions
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
    const SHOPIFY_STORE = process.env.SHOPIFY_STORE || "idealfit-2.myshopify.com";
    
    if (!SHOPIFY_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: "SHOPIFY_ACCESS_TOKEN not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Test 1: Fetch a single order
    const orderResponse = await fetch(`https://${SHOPIFY_STORE}/admin/api/2025-01/orders.json?limit=1&status=any`, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json"
      }
    });

    let orderData = null;
    if (orderResponse.ok) {
      const data = await orderResponse.json();
      orderData = {
        status: orderResponse.status,
        orderCount: data.orders?.length || 0,
        firstOrderId: data.orders?.[0]?.id,
        firstOrderCustomerId: data.orders?.[0]?.customer?.id,
        firstOrderCustomer: data.orders?.[0]?.customer,
        firstOrderEmail: data.orders?.[0]?.email,
        firstOrderBillingAddress: data.orders?.[0]?.billing_address,
        firstOrderShippingAddress: data.orders?.[0]?.shipping_address
      };
    } else {
      orderData = { status: orderResponse.status, error: await orderResponse.text() };
    }

    // Test 2: Fetch customers
    const customersResponse = await fetch(`https://${SHOPIFY_STORE}/admin/api/2025-01/customers.json?limit=1`, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json"
      }
    });

    let customersData = null;
    if (customersResponse.ok) {
      const data = await customersResponse.json();
      customersData = {
        status: customersResponse.status,
        customerCount: data.customers?.length || 0,
        firstCustomer: data.customers?.[0]
      };
    } else {
      customersData = { status: customersResponse.status, error: await customersResponse.text() };
    }

    // Test 3: Fetch a specific customer if we have an ID
    let specificCustomerData = null;
    if (orderData?.firstOrderCustomerId) {
      const specificCustomerResponse = await fetch(`https://${SHOPIFY_STORE}/admin/api/2025-01/customers/${orderData.firstOrderCustomerId}.json`, {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json"
        }
      });

      if (specificCustomerResponse.ok) {
        const data = await specificCustomerResponse.json();
        specificCustomerData = {
          status: specificCustomerResponse.status,
          customer: data.customer
        };
      } else {
        specificCustomerData = { status: specificCustomerResponse.status, error: await specificCustomerResponse.text() };
      }
    }

    return new Response(JSON.stringify({
      store: SHOPIFY_STORE,
      tokenConfigured: !!SHOPIFY_ACCESS_TOKEN,
      orderTest: orderData,
      customersTest: customersData,
      specificCustomerTest: specificCustomerData
    }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
