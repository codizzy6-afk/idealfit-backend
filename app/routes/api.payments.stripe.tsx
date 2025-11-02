import type { ActionFunctionArgs } from "react-router";

// Stripe Payment API
// POST /api/payments/stripe - Initialize Stripe checkout session
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

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    
    if (!STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Stripe not configured. Please add STRIPE_SECRET_KEY to environment variables." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert to smallest currency unit (cents for USD, paise for INR)
    const amountInCents = Math.round(amount * 100);

    // Create Stripe Checkout Session
    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        mode: "payment",
        payment_method_types: "card",
        line_items: JSON.stringify([{
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Invoice ${invoiceNumber}`,
              description: description || `Payment for ${shop}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        }]),
        success_url: `${process.env.SHOPIFY_APP_URL || "https://ideal-fit-app1.onrender.com"}/app/merchant-dashboard?payment=success&invoice=${invoiceId}`,
        cancel_url: `${process.env.SHOPIFY_APP_URL || "https://ideal-fit-app1.onrender.com"}/app/merchant-dashboard?payment=cancelled&invoice=${invoiceId}`,
        metadata: JSON.stringify({
          invoiceId,
          invoiceNumber,
          shop,
        }),
      }),
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json();
      console.error("Stripe API error:", errorData);
      return new Response(
        JSON.stringify({ success: false, error: "Stripe payment initialization failed", details: errorData }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const session = await stripeResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: session.id,
        checkoutUrl: session.url,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Stripe payment error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Payment processing failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

