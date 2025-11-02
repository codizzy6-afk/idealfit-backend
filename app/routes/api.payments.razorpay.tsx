import type { ActionFunctionArgs } from "react-router";

// Razorpay Payment API
// POST /api/payments/razorpay - Initialize Razorpay order
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { invoiceId, invoiceNumber, amount, currency, shop, description } = body;

    if (!invoiceId || !amount || !shop) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      // Demo mode - return mock order for testing
      console.log("⚠️ Razorpay not configured. Running in DEMO MODE.");
      const mockOrderId = "order_demo_" + Date.now();
      return new Response(
        JSON.stringify({
          success: true,
          orderId: mockOrderId,
          keyId: "rzp_demo",
          amount: Math.round(amount * 100),
          currency: "INR",
          invoiceId,
          invoiceNumber,
          demo: true,
          demoMessage: "Demo mode: Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable real payments",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert to paise (100 * INR amount)
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay Order
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: invoiceNumber,
        notes: {
          invoiceId,
          shop,
          description: description || `Payment for ${shop}`,
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      console.error("Razorpay API error:", errorData);
      console.error("Status code:", razorpayResponse.status);
      console.error("Request body:", { amount: amountInPaise, currency: "INR", receipt: invoiceNumber });
      return new Response(
        JSON.stringify({ success: false, error: "Razorpay order creation failed", details: errorData }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const order = await razorpayResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        keyId: RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: "INR",
        invoiceId,
        invoiceNumber,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Razorpay payment error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Payment processing failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

