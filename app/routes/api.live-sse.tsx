import type { LoaderFunctionArgs } from "react-router";
import { getWebhookVersion } from "../utils/cache.server";

// Server-Sent Events endpoint for live webhook version updates per shop
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || process.env.SHOPIFY_STORE || "idealfit-2.myshopify.com";

  const stream = new ReadableStream<{ data: string }>({
    start(controller) {
      function send(event: string, payload: unknown) {
        const line = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
        controller.enqueue(new TextEncoder().encode(line) as unknown as { data: string });
      }

      let lastVersion = -1;
      // Send initial snapshot
      const initial = getWebhookVersion(shop);
      lastVersion = initial.version;
      send("init", { shop, version: initial.version, lastWebhookTs: initial.ts });

      const interval = setInterval(() => {
        try {
          const curr = getWebhookVersion(shop);
          if (curr.version !== lastVersion) {
            lastVersion = curr.version;
            send("update", { shop, version: curr.version, lastWebhookTs: curr.ts });
          } else {
            // heartbeat
            send("ping", { ts: Date.now() });
          }
        } catch (e) {
          // End on error
          clearInterval(interval);
          controller.close();
        }
      }, 5000);

      // Close handler if client disconnects
      (request as any).signal?.addEventListener?.("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  }) as unknown as ReadableStream;

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
};


