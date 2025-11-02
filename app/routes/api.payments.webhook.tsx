import type { ActionFunctionArgs } from "react-router";
import prisma from "../db.server";
import crypto from "crypto";

// Payment Webhook Handler
// POST /api/payments/webhook - Handle Stripe/Razorpay webhook callbacks
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || request.headers.get("x-razorpay-signature");
    const provider = request.headers.get("stripe-signature") ? "stripe" : "razorpay";

    if (!signature) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing signature" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse JSON
    const event = JSON.parse(body);

    if (provider === "stripe") {
      // Stripe webhook
      const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!WEBHOOK_SECRET) {
        console.warn("STRIPE_WEBHOOK_SECRET not configured, skipping signature verification");
      } else {
        const elements = signature.split(",");
        const sigHash = elements.find(el => el.startsWith("t="))?.split("=")[1];
        const timestamp = sigHash ? sigHash.split("_")[0] : null;

        if (!timestamp) {
          return new Response(
            JSON.stringify({ success: false, error: "Invalid signature" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      // Handle Stripe checkout.session.completed event
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const metadata = session.metadata;

        if (metadata && metadata.invoiceId) {
          // Update invoice status in database
          await prisma.invoice.update({
            where: { id: metadata.invoiceId },
            data: {
              status: "paid",
              paymentMethod: "stripe",
              paymentId: session.id,
              paidAt: new Date(),
            },
          });

          console.log(`✅ Invoice ${metadata.invoiceNumber} marked as paid via Stripe`);
        }
      }
    } else if (provider === "razorpay") {
      // Razorpay webhook
      const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
      
      if (!WEBHOOK_SECRET) {
        console.warn("RAZORPAY_WEBHOOK_SECRET not configured, skipping signature verification");
      } else {
        const expectedSignature = crypto
          .createHmac("sha256", WEBHOOK_SECRET)
          .update(body)
          .digest("hex");

        if (signature !== expectedSignature) {
          return new Response(
            JSON.stringify({ success: false, error: "Invalid signature" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      // Handle Razorpay payment.captured event
      if (event.event === "payment.captured") {
        const payment = event.payload.payment.entity;
        const notes = payment.notes;

        if (notes && notes.invoiceId) {
          // Update invoice status in database
          await prisma.invoice.update({
            where: { id: notes.invoiceId },
            data: {
              status: "paid",
              paymentMethod: "razorpay",
              paymentId: payment.id,
              paidAt: new Date(),
            },
          });

          console.log(`✅ Invoice ${notes.invoiceNumber} marked as paid via Razorpay`);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Payment webhook error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Webhook processing failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

