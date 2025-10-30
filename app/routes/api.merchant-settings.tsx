import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import prisma from "../db.server";

// GET /api/merchant-settings?merchantId=...
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const merchantId = url.searchParams.get("merchantId");

    if (!merchantId) {
      return new Response(JSON.stringify({ success: false, error: "merchantId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { id: true, username: true, email: true, shopDomain: true },
    });

    if (!merchant) {
      return new Response(JSON.stringify({ success: false, error: "Merchant not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data: merchant }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

// POST /api/merchant-settings (FormData: merchantId, shopDomain, shopifyAccessToken)
export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const merchantId = String(formData.get("merchantId") || "");
    const shopDomain = (formData.get("shopDomain") as string | null)?.trim() || null;
    const shopifyAccessToken = (formData.get("shopifyAccessToken") as string | null)?.trim() || null;

    if (!merchantId) {
      return new Response(JSON.stringify({ success: false, error: "merchantId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!shopDomain || !shopifyAccessToken) {
      return new Response(
        JSON.stringify({ success: false, error: "shopDomain and shopifyAccessToken are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const updated = await prisma.merchant.update({
      where: { id: merchantId },
      data: { shopDomain, shopifyAccessToken },
      select: { id: true, shopDomain: true },
    });

    return new Response(JSON.stringify({ success: true, data: updated }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};


