import type { LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || process.env.SHOPIFY_STORE || "idealfit-2.myshopify.com";
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  const q = url.searchParams.get("q") || ""; // search query

  if (!token) {
    return new Response(JSON.stringify({ success: false, error: "SHOPIFY_ACCESS_TOKEN not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const query = q ? `?title=${encodeURIComponent(q)}&limit=50` : "?limit=50";

  const res = await fetch(`https://${shop}/admin/api/2025-01/products.json${query}`, {
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(JSON.stringify({ success: false, error: text || `Shopify error ${res.status}` }), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const json = await res.json();
  const products = (json.products || []).map((p: any) => ({ id: p.id.toString(), title: p.title }));

  return new Response(JSON.stringify({ success: true, data: products }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
};