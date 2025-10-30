import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { invalidateShopCaches } from "../utils/cache.server";

// Receives Shopify ORDERS_UPDATED webhook
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  try {
    console.log(`[Webhook] ${topic} received for ${shop} | order id:`, payload?.id || payload?.admin_graphql_api_id);
    invalidateShopCaches(shop);
  } catch (err) {
    console.error("ORDERS_UPDATED webhook handler error:", err);
  }

  return new Response();
};


