import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import db from "../db.server";

function normalize(raw: any) {
  return {
    base: Array.isArray(raw?.base) ? raw.base : Array.isArray(raw) ? raw : [],
    overrides: raw?.overrides || { products: {}, collections: {} },
    versions: raw?.versions || [],
    title: raw?.title || "Size Chart",
  };
}

// GET: list versions
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "idealfit-2.myshopify.com";
  const row = await db.sizeChart.findFirst({ where: { shop } });
  if (!row) {
    return new Response(JSON.stringify({ success: true, data: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const parsed = normalize(JSON.parse(row.chartData));
  const versions = parsed.versions || [];
  return new Response(JSON.stringify({ success: true, data: versions }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
};

// POST: rollback to a version by timestamp
export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.json();
  const shop: string = body.shop || "idealfit-2.myshopify.com";
  const ts: string = body.ts; // version timestamp
  if (!ts) {
    return new Response(JSON.stringify({ success: false, error: "Missing version timestamp" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const row = await db.sizeChart.findFirst({ where: { shop } });
  if (!row) {
    return new Response(JSON.stringify({ success: false, error: "Size chart not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  const parsed = normalize(JSON.parse(row.chartData));
  const match = (parsed.versions || []).find((v: any) => v.ts === ts);
  if (!match) {
    return new Response(JSON.stringify({ success: false, error: "Version not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  // Push current as a new version, then restore
  const now = new Date().toISOString();
  parsed.versions.push({ ts: now, note: "pre-rollback", base: parsed.base });
  parsed.base = match.base || [];

  await db.sizeChart.update({
    where: { id: row.id },
    data: { chartData: JSON.stringify(parsed), updatedAt: new Date() },
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
};


