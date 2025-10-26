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

    // Fetch orders from Shopify REST API with customer info
    const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2025-01/orders.json?limit=${limit}&status=any`, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Fetch individual customer details for each order (skip bulk fetch to avoid rate limits)
    const customersData: any = {};
    const uniqueCustomerIds = [...new Set(data.orders.map((o: any) => o.customer?.id).filter(Boolean))];
    
    // Fetch each customer individually to get full details
    for (const customerId of uniqueCustomerIds) {
      try {
        const customerResponse = await fetch(`https://${SHOPIFY_STORE}/admin/api/2025-01/customers/${customerId}.json`, {
          headers: {
            "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
            "Content-Type": "application/json"
          }
        });
        
        if (customerResponse.ok) {
          const customerJson = await customerResponse.json();
          customersData[customerId] = customerJson.customer;
        } else {
          console.log(`Failed to fetch customer ${customerId}: ${customerResponse.status}`);
        }
        
        // Add delay to avoid rate limits (50ms between requests)
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (e) {
        console.log(`Could not fetch customer ${customerId}:`, e);
      }
    }

    // Transform data to match expected format
    const orders = data.orders.map((order: any) => {
      // Extract measurements from order attributes or metafields
      const measurements: any = {};
      
      // Check note_attributes first
      if (order.note_attributes) {
        order.note_attributes.forEach((attr: any) => {
          if (attr.name && attr.value) {
            if (attr.name.includes('measurement_bust') || attr.name.includes('measurement_waist') || attr.name.includes('measurement_hip') || attr.name.includes('measurement_unit') || attr.name.includes('recommended_size')) {
              const key = attr.name.replace('_measurement_', '').replace('_', '');
              measurements[key] = attr.value;
            }
          }
        });
      }
      
      // Also check line_items for cart attributes
      if (order.line_items) {
        order.line_items.forEach((item: any) => {
          if (item.properties && Array.isArray(item.properties)) {
            item.properties.forEach((prop: any) => {
              if (prop.name && prop.value) {
                if (prop.name.includes('measurement_bust') || prop.name.includes('measurement_waist') || prop.name.includes('measurement_hip') || prop.name.includes('measurement_unit') || prop.name.includes('recommended_size')) {
                  const key = prop.name.replace('_measurement_', '').replace('_', '');
                  measurements[key] = prop.value;
                }
              }
            });
          }
        });
      }

      // Get customer details from fetched customers or order
      const customerId = order.customer?.id;
      const customerDetails = customersData[customerId] || null;
      
      // Now that permissions are updated, extract customer data
      const firstName = order.billing_address?.first_name || order.shipping_address?.first_name || order.customer?.first_name || customerDetails?.first_name || '';
      const lastName = order.billing_address?.last_name || order.shipping_address?.last_name || order.customer?.last_name || customerDetails?.last_name || '';
      const email = order.email || order.customer?.email || customerDetails?.email || 'No email';
      const phone = order.phone || order.billing_address?.phone || order.shipping_address?.phone || order.customer?.phone || customerDetails?.phone || 'No phone';
      
      // Use the most complete address object available
      const addressObj = order.billing_address || order.shipping_address || customerDetails?.default_address || {};
      
      return {
        id: order.id,
        orderNumber: order.order_number,
        orderName: order.name,
        createdAt: order.created_at,
        customer: {
          id: customerId,
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          address: {
            address1: addressObj.address1 || 'No address',
            city: addressObj.city || 'No city',
            province: addressObj.province || 'No state',
            country: addressObj.country || 'No country',
            zip: addressObj.zip || ''
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
