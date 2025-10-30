import type { LoaderFunctionArgs } from "react-router";
import { getWebhookVersion } from "../utils/cache.server";

// Simple live status endpoint: returns per-shop version and last webhook timestamp
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || process.env.SHOPIFY_STORE || "idealfit-2.myshopify.com";
  const live = getWebhookVersion(shop);

  return new Response(
    JSON.stringify({ success: true, data: { shop, version: live.version, lastWebhookTs: live.ts } }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
};


