import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

// Receives Shopify ORDERS_CREATE webhook
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  try {
    console.log(`[Webhook] ${topic} received for ${shop} | order id:`, payload?.id || payload?.admin_graphql_api_id);
    // TODO: enqueue background refresh of analytics/billing caches per shop
  } catch (err) {
    console.error("ORDERS_CREATE webhook handler error:", err);
  }

  return new Response();
};


