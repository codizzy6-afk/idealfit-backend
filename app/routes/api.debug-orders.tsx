import type { LoaderFunctionArgs } from "react-router";

// Debug endpoint to see what's happening with customer fetching
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

    // Fetch one order
    const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2025-01/orders.json?limit=1&status=any`, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Orders API error: ${response.status}` }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
    const order = data.orders?.[0];
    const customerId = order?.customer?.id;

    const debug: any = {
      orderExists: !!order,
      customerId: customerId,
      orderCustomerObject: order?.customer,
      orderEmail: order?.email
    };

    if (customerId) {
      try {
        const customerResponse = await fetch(`https://${SHOPIFY_STORE}/admin/api/2025-01/customers/${customerId}.json`, {
          headers: {
            "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
            "Content-Type": "application/json"
          }
        });

        debug.customerFetchStatus = customerResponse.status;
        
        if (customerResponse.ok) {
          const customerJson = await customerResponse.json();
          debug.customerData = {
            id: customerJson.customer?.id,
            email: customerJson.customer?.email,
            firstName: customerJson.customer?.first_name,
            lastName: customerJson.customer?.last_name,
            phone: customerJson.customer?.phone,
            hasAddresses: !!customerJson.customer?.addresses,
            addressCount: customerJson.customer?.addresses?.length || 0,
            // Add raw keys to see what's available
            allKeys: Object.keys(customerJson.customer || {})
          };
          // Also log the full customer object
          debug.fullCustomerData = customerJson.customer;
        } else {
          debug.customerFetchError = await customerResponse.text();
        }
      } catch (e) {
        debug.customerFetchException = e instanceof Error ? e.message : String(e);
      }
    }

    return new Response(JSON.stringify(debug, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" }
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
