import type { LoaderFunctionArgs } from "react-router";
import db from "../db.server";

// API endpoint to fetch size charts
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    const where: any = {};
    if (shop) {
      where.shop = shop;
    }

    // Fetch size charts from database
    const sizeCharts = await db.sizeChart.findMany({
      where,
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Parse and format data to match dashboard expectations
    const formattedCharts = sizeCharts.map(chart => ({
      id: chart.id,
      shop: chart.shop,
      title: chart.title,
      sizeChart: JSON.parse(chart.chartData), // Dashboard expects 'sizeChart' key
      createdAt: chart.createdAt.toISOString(),
      updatedAt: chart.updatedAt.toISOString()
    }));

    return new Response(JSON.stringify(formattedCharts), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });

  } catch (error) {
    console.error("Error fetching size charts:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: []
    }), { 
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};

// Handle OPTIONS for CORS
export const OPTIONS = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};

