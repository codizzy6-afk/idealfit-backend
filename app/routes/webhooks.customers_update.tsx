import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { invalidateShopCaches } from "../utils/cache.server";

// Receives Shopify CUSTOMERS_UPDATE webhook
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  try {
    console.log(`[Webhook] ${topic} received for ${shop} | customer id:`, payload?.id || payload?.admin_graphql_api_id);
    invalidateShopCaches(shop);
  } catch (err) {
    console.error("CUSTOMERS_UPDATE webhook handler error:", err);
  }

  return new Response();
};


