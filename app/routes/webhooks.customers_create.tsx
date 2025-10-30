import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

// Receives Shopify CUSTOMERS_CREATE webhook
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  try {
    console.log(`[Webhook] ${topic} received for ${shop} | customer id:`, payload?.id || payload?.admin_graphql_api_id);
    // TODO: enqueue background refresh of customer cache
  } catch (err) {
    console.error("CUSTOMERS_CREATE webhook handler error:", err);
  }

  return new Response();
};


