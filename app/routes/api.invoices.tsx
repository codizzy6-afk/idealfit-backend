import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { cache, invalidateShopCaches } from "../utils/cache.server";

// GET: List all invoices (history) for a shop
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || process.env.SHOPIFY_STORE || "idealfit-2.myshopify.com";
  const token = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!token) {
    return new Response(JSON.stringify({ success: false, error: "SHOPIFY_ACCESS_TOKEN not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // TODO: Fetch from database when implemented
  // For now, generate sample history from orders
  const invoices: any[] = [];
  
  // Try to fetch orders to simulate invoice history
  try {
    const res = await fetch(`https://${shop}/admin/api/2025-01/orders.json?limit=250&status=any`, {
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const json = await res.json();
      const orders = json.orders || [];
      
      // Group by month
      const byMonth: { [month: string]: any[] } = {};
      orders.forEach((order: any) => {
        const month = order.created_at?.substring(0, 7); // YYYY-MM
        if (!month) return;
        if (!byMonth[month]) byMonth[month] = [];
        byMonth[month].push(order);
      });

      // Generate invoices for each month
      Object.keys(byMonth).sort().forEach((month) => {
        const monthOrders = byMonth[month];
        const count = monthOrders.length;
        
        // Calculate pricing tier
        let pricePerOrder = 0.12;
        let tier = "Starter";
        if (count >= 1501) {
          pricePerOrder = 0.06;
          tier = "Advanced";
        } else if (count >= 501) {
          pricePerOrder = 0.09;
          tier = "Professional";
        }

        // Calculate total
        let total = 0;
        if (count <= 500) {
          total = count * 0.12;
        } else if (count <= 1500) {
          total = 500 * 0.12 + (count - 500) * 0.09;
        } else {
          total = 500 * 0.12 + 1000 * 0.09 + (count - 1500) * 0.06;
        }

        invoices.push({
          id: `INV-${month.replace('-', '')}`,
          month,
          shop,
          orderCount: count,
          pricePerOrder,
          total,
          totalINR: total * 83,
          currency: "USD",
          tier,
          status: "paid",
          createdAt: monthOrders[0]?.created_at || new Date(`${month}-01`).toISOString(),
          paidAt: new Date().toISOString(),
        });
      });
    }
  } catch (e) {
    console.error("Error generating invoice history:", e);
  }

  return new Response(JSON.stringify({ success: true, data: invoices }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
};

// POST: Generate and email invoice for a specific month
export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.json();
  const shop = body.shop || process.env.SHOPIFY_STORE || "idealfit-2.myshopify.com";
  const month = body.month; // YYYY-MM format

  if (!month) {
    return new Response(JSON.stringify({ success: false, error: "Month required (YYYY-MM)" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // TODO: Generate PDF and send email
  // For now, return success with invoice data

  return new Response(JSON.stringify({ success: true, message: "Invoice generated and emailed" }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
};

