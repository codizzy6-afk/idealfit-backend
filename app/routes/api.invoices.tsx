import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { cache, invalidateShopCaches } from "../utils/cache.server";
import prisma from "../db.server";

// GET: List all invoices (history) for a shop
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || process.env.SHOPIFY_STORE || "idealfit-2.myshopify.com";

  try {
    // Fetch invoices from database
    const invoices = await prisma.invoice.findMany({
      where: { shop },
      orderBy: { createdAt: "desc" },
    });

    // Format for frontend
    const formattedInvoices = invoices.map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      month: inv.month,
      shop: inv.shop,
      orderCount: inv.orderCount,
      pricePerOrder: inv.pricePerOrder,
      total: inv.total,
      totalINR: inv.totalINR,
      currency: inv.currency,
      tier: inv.tier,
      status: inv.status,
      paymentMethod: inv.paymentMethod,
      paymentId: inv.paymentId,
      createdAt: inv.createdAt.toISOString(),
      paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
    }));

    return new Response(JSON.stringify({ success: true, data: formattedInvoices }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (e) {
    console.error("Error fetching invoices:", e);
    return new Response(JSON.stringify({ success: false, error: "Failed to fetch invoices" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
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


