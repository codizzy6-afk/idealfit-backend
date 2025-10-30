import type { LoaderFunctionArgs } from "react-router";

// Billing API endpoint - calculates usage and billing based on order count
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const merchantId = url.searchParams.get("merchantId");

    let SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
    let SHOPIFY_STORE = process.env.SHOPIFY_STORE || "idealfit-2.myshopify.com";

    if (merchantId) {
      try {
        const db = (await import("../db.server")).default;
        const merchant = await db.merchant.findUnique({ where: { id: merchantId } });
        if (merchant?.shopifyAccessToken && merchant.shopDomain) {
          SHOPIFY_ACCESS_TOKEN = merchant.shopifyAccessToken;
          SHOPIFY_STORE = merchant.shopDomain;
        }
      } catch (_) {}
    }
    
    if (!SHOPIFY_ACCESS_TOKEN) {
      throw new Error("SHOPIFY_ACCESS_TOKEN not configured");
    }

    // Fetch orders from Shopify
    const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2025-01/orders.json?limit=250&status=any`, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    const orders = data.orders || [];

    // Get current month's orders
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const currentMonthOrders = orders.filter((order: any) => {
      if (!order.created_at) return false;
      const orderMonth = order.created_at.substring(0, 7); // YYYY-MM
      return orderMonth === currentMonth;
    });

    const orderCount = currentMonthOrders.length;

    // Define pricing tiers
    const tiers = [
      { min: 1, max: 500, pricePerOrder: 0.12, name: 'Starter', currency: 'USD' },
      { min: 501, max: 1500, pricePerOrder: 0.09, name: 'Professional', currency: 'USD' },
      { min: 1501, max: Infinity, pricePerOrder: 0.06, name: 'Advanced', currency: 'USD' }
    ];

    // Find current tier
    const currentTier = tiers.find(tier => orderCount >= tier.min && orderCount <= tier.max) || tiers[0];
    
    // Calculate billing
    let totalBill = 0;
    
    if (orderCount > 0) {
      if (orderCount <= 500) {
        totalBill = orderCount * 0.12;
      } else if (orderCount <= 1500) {
        totalBill = (500 * 0.12) + ((orderCount - 500) * 0.09);
      } else {
        totalBill = (500 * 0.12) + (1000 * 0.09) + ((orderCount - 1500) * 0.06);
      }
    }

    // Detect currency based on Shopify store settings (default to USD, can be set to INR)
    const currency = 'USD'; // Can be made dynamic based on store settings
    const exchangeRate = 83.0; // USD to INR
    const totalBillINR = totalBill * exchangeRate;

    // Get next tier info
    const nextTier = tiers.find(tier => orderCount < tier.min);
    const ordersToNextTier = nextTier ? nextTier.min - orderCount : null;

    return new Response(JSON.stringify({
      success: true,
      data: {
        currentMonth: {
          month: currentMonth,
          orderCount,
          totalBill: parseFloat(totalBill.toFixed(2)),
          totalBillINR: parseFloat(totalBillINR.toFixed(2)),
          currentTier: currentTier.name,
          pricePerOrder: currentTier.pricePerOrder,
          currency: currency
        },
        pricing: {
          currentTier: {
            name: currentTier.name,
            range: `${currentTier.min}-${currentTier.max === Infinity ? '∞' : currentTier.max} orders`,
            pricePerOrder: currentTier.pricePerOrder,
            currency: currency
          },
          nextTier: nextTier ? {
            name: nextTier.name,
            ordersNeeded: ordersToNextTier,
            pricePerOrder: nextTier.pricePerOrder
          } : null
        },
        invoiceGenerated: false, // Placeholder for invoice generation
        lastInvoiceDate: null
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    console.error("Error fetching billing:", error);
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
