import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import db from "../db.server";

// Helper to ensure structure in chartData
function normalizeChartData(raw: any) {
  const base = Array.isArray(raw?.base) ? raw.base : Array.isArray(raw) ? raw : [];
  return {
    base,
    overrides: raw?.overrides || { products: {}, collections: {} },
    versions: raw?.versions || [],
    title: raw?.title || "Size Chart",
  };
}

// GET: fetch override for product/collection
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "idealfit-2.myshopify.com";
  const productId = url.searchParams.get("productId");
  const collectionId = url.searchParams.get("collectionId");

  const row = await db.sizeChart.findFirst({ where: { shop } });
  if (!row) {
    return new Response(JSON.stringify({ success: true, data: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = normalizeChartData(JSON.parse(row.chartData));
  let override: any = null;
  if (productId) override = parsed.overrides.products?.[productId] || null;
  if (!override && collectionId) override = parsed.overrides.collections?.[collectionId] || null;

  return new Response(
    JSON.stringify({ success: true, data: { base: parsed.base, override, title: parsed.title } }),
    { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
  );
};

// POST: set override for product/collection, and append a version snapshot
export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.json();
  const shop: string = body.shop || "idealfit-2.myshopify.com";
  const productId: string | undefined = body.productId;
  const collectionId: string | undefined = body.collectionId;
  const override: any[] = body.sizeChart || [];
  const note: string | undefined = body.note;

  const row = await db.sizeChart.findFirst({ where: { shop } });
  if (!row) {
    return new Response(JSON.stringify({ success: false, error: "Size chart not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = normalizeChartData(JSON.parse(row.chartData));
  const now = new Date().toISOString();
  // Save current snapshot to versions
  parsed.versions.push({ ts: now, note: note || "override update", base: parsed.base });

  // Apply override
  if (productId) {
    parsed.overrides.products = parsed.overrides.products || {};
    parsed.overrides.products[productId] = override;
  } else if (collectionId) {
    parsed.overrides.collections = parsed.overrides.collections || {};
    parsed.overrides.collections[collectionId] = override;
  }

  const updated = await db.sizeChart.update({
    where: { id: row.id },
    data: { chartData: JSON.stringify(parsed), updatedAt: new Date() },
  });

  return new Response(JSON.stringify({ success: true, data: { id: updated.id } }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
};


