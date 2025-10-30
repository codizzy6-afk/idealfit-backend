import type { ActionFunctionArgs } from "react-router";

// Sync a chart (base or override) into a product metafield
// Request body: { shop, productId, namespace, key, sizeChart }
export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.json();
  const shop: string = body.shop || process.env.SHOPIFY_STORE || "idealfit-2.myshopify.com";
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  const productId: string = body.productId;
  const namespace: string = body.namespace || "idealfit";
  const key: string = body.key || "size_chart";
  const sizeChart: any = body.sizeChart || [];

  if (!token) {
    return new Response(JSON.stringify({ success: false, error: "SHOPIFY_ACCESS_TOKEN not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!productId) {
    return new Response(JSON.stringify({ success: false, error: "Missing productId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const metafieldPayload = {
    metafield: {
      namespace,
      key,
      type: "json",
      value: JSON.stringify(sizeChart),
    },
  };

  // Create metafield
  const res = await fetch(`https://${shop}/admin/api/2025-01/products/${productId}/metafields.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metafieldPayload),
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(JSON.stringify({ success: false, error: text || `Shopify error ${res.status}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const json = await res.json();
  return new Response(JSON.stringify({ success: true, data: json.metafield }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
};


