import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
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
    const formattedCharts = sizeCharts.map(chart => {
      try {
        // Safely parse chartData, handle corrupted data
        const parsedChartData = typeof chart.chartData === 'string' 
          ? JSON.parse(chart.chartData) 
          : chart.chartData;
        
        return {
          id: chart.id,
          shop: chart.shop,
          title: chart.title,
          sizeChart: parsedChartData, // Dashboard expects 'sizeChart' key
          createdAt: chart.createdAt.toISOString(),
          updatedAt: chart.updatedAt.toISOString()
        };
      } catch (parseError) {
        console.error(`Error parsing chart data for shop ${chart.shop}:`, parseError);
        // Return default empty chart if parsing fails
        return {
          id: chart.id,
          shop: chart.shop,
          title: chart.title,
          sizeChart: [],
          createdAt: chart.createdAt.toISOString(),
          updatedAt: chart.updatedAt.toISOString()
        };
      }
    });

    return new Response(JSON.stringify({
      success: true,
      data: formattedCharts
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0"
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

// Handle POST for saving size charts
export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const body = await request.json();
    const { shop, sizeChart, title } = body;

    if (!shop || !sizeChart) {
      return new Response(JSON.stringify({
        success: false,
        error: "Shop and sizeChart are required"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Upsert size chart
    const upserted = await db.sizeChart.upsert({
      where: {
        shop: shop
      },
      update: {
        chartData: JSON.stringify(sizeChart),
        title: title || "Default Size Chart",
        updatedAt: new Date()
      },
      create: {
        shop: shop,
        chartData: JSON.stringify(sizeChart),
        title: title || "Default Size Chart"
      }
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: upserted.id,
        shop: upserted.shop,
        title: upserted.title,
        sizeChart: JSON.parse(upserted.chartData),
        createdAt: upserted.createdAt.toISOString(),
        updatedAt: upserted.updatedAt.toISOString()
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });

  } catch (error) {
    console.error("Error saving size chart:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};

