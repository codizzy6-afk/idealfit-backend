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
      
      // Check note_attributes first
      order.note_attributes?.forEach((attr: any) => {
        if (attr.name.includes('measurement_bust') || attr.name.includes('measurement_waist') || attr.name.includes('measurement_hip') || attr.name.includes('measurement_unit') || attr.name.includes('recommended_size')) {
          const key = attr.name.replace('_measurement_', '').replace('_', '');
          measurements[key] = attr.value;
        }
      });
      
      // Also check line_items for cart attributes
      order.line_items?.forEach((item: any) => {
        if (item.properties) {
          item.properties.forEach((prop: any) => {
            if (prop.name.includes('measurement_bust') || prop.name.includes('measurement_waist') || prop.name.includes('measurement_hip') || prop.name.includes('measurement_unit') || prop.name.includes('recommended_size')) {
              const key = prop.name.replace('_measurement_', '').replace('_', '');
              measurements[key] = prop.value;
            }
          });
        }
      });

      // Extract full name from first_name and last_name
      const firstName = order.customer?.first_name || order.billing_address?.first_name || '';
      const lastName = order.customer?.last_name || order.billing_address?.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Unnamed Customer';

      return {
        id: order.id,
        orderNumber: order.order_number,
        orderName: order.name,
        createdAt: order.created_at,
        customer: {
          id: order.customer?.id,
          firstName: firstName,
          lastName: lastName,
          email: order.email || order.customer?.email || 'No email',
          phone: order.phone || order.billing_address?.phone || order.customer?.phone || 'No phone',
          address: {
            address1: order.billing_address?.address1 || order.shipping_address?.address1 || 'No address',
            city: order.billing_address?.city || order.shipping_address?.city || 'No city',
            province: order.billing_address?.province || order.shipping_address?.province || 'No state',
            country: order.billing_address?.country || order.shipping_address?.country || 'No country',
            zip: order.billing_address?.zip || order.shipping_address?.zip || ''
          }
        },
        measurements: {
          bust: measurements.bust || measurements.measurement_bust || null,
          waist: measurements.waist || measurements.measurement_waist || null,
          hip: measurements.hip || measurements.measurement_hip || null,
          recommendedSize: measurements.recommendedsize || measurements.recommended_size || measurements.size || null
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
