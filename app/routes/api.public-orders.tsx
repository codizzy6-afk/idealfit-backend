import type { LoaderFunctionArgs } from "react-router";

// Public API endpoint to fetch Shopify orders - NO AUTHENTICATION REQUIRED
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");

    // Use your Shopify access token from environment variables
    const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
    const SHOPIFY_STORE = process.env.SHOPIFY_STORE || "idealfit-2.myshopify.com";
    
    if (!SHOPIFY_ACCESS_TOKEN) {
      throw new Error("SHOPIFY_ACCESS_TOKEN not configured");
    }

    // Fetch orders from Shopify REST API
    const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2025-01/orders.json?limit=${limit}`, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform data to match expected format
    const orders = data.orders.map((order: any) => {
      // Extract measurements from order attributes or metafields
      const measurements: any = {};
      order.note_attributes?.forEach((attr: any) => {
        if (attr.name.includes('bust') || attr.name.includes('waist') || attr.name.includes('hip') || attr.name.includes('size')) {
          measurements[attr.name.replace('_measurement_', '').replace('_', '')] = attr.value;
        }
      });

      return {
        id: order.id,
        orderNumber: order.order_number,
        orderName: order.name,
        createdAt: order.created_at,
        customer: {
          id: order.customer?.id,
          firstName: order.customer?.first_name || order.billing_address?.first_name,
          lastName: order.customer?.last_name || order.billing_address?.last_name,
          email: order.email,
          phone: order.phone || order.billing_address?.phone,
          address: {
            address1: order.billing_address?.address1,
            city: order.billing_address?.city,
            province: order.billing_address?.province,
            country: order.billing_address?.country,
          }
        },
        measurements: {
          bust: measurements.bust || null,
          waist: measurements.waist || null,
          hip: measurements.hip || null,
          recommendedSize: measurements.recommendedsize || measurements.size || null
        }
      };
    });

    return new Response(JSON.stringify({
      success: true,
      data: orders
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
