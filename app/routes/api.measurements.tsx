import type { LoaderFunctionArgs } from "react-router";
import db from "../db.server";

// API endpoint to fetch measurement submissions
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");
    const month = url.searchParams.get("month");
    const year = url.searchParams.get("year");
    const size = url.searchParams.get("size");

    // Build query filters
    const where: any = {};
    
    if (shop) {
      where.shop = shop;
    }

    // Date filters
    if (month || year) {
      const dateFilter: any = {};
      
      if (year && month) {
        const startDate = new Date(parseInt(year), parseInt(month), 1);
        const endDate = new Date(parseInt(year), parseInt(month) + 1, 0);
        dateFilter.gte = startDate;
        dateFilter.lte = endDate;
      } else if (year) {
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year), 11, 31);
        dateFilter.gte = startDate;
        dateFilter.lte = endDate;
      }
      
      if (Object.keys(dateFilter).length > 0) {
        where.date = dateFilter;
      }
    }

    // Size filter
    if (size) {
      where.recommendedSize = size;
    }

    // Fetch submissions from database
    const submissions = await db.submission.findMany({
      where,
      orderBy: {
        date: 'desc'
      }
    });

    // Format data for dashboard
    const formattedData = submissions.map(s => ({
      id: s.id,
      date: s.date.toISOString().split('T')[0],
      name: s.customerName || 'Anonymous',
      email: '', // Email not stored in current schema
      bust: s.bust,
      waist: s.waist,
      hip: s.hip,
      size: s.recommendedSize,
      orderId: s.orderId || 'N/A',
      productId: s.productId || '',
      shop: s.shop
    }));

    // Calculate analytics
    const sizeDistribution: Record<string, number> = {};
    const sizeAverages: Record<string, { bust: number[], waist: number[], hip: number[], count: number }> = {};

    submissions.forEach(s => {
      const size = s.recommendedSize;
      
      // Count distribution
      sizeDistribution[size] = (sizeDistribution[size] || 0) + 1;
      
      // Collect measurements for averages
      if (!sizeAverages[size]) {
        sizeAverages[size] = { bust: [], waist: [], hip: [], count: 0 };
      }
      sizeAverages[size].bust.push(s.bust);
      sizeAverages[size].waist.push(s.waist);
      sizeAverages[size].hip.push(s.hip);
      sizeAverages[size].count++;
    });

    // Calculate averages
    const analytics = Object.entries(sizeAverages).map(([size, data]) => ({
      size,
      count: data.count,
      percentage: ((data.count / submissions.length) * 100).toFixed(1),
      avgBust: (data.bust.reduce((a, b) => a + b, 0) / data.count).toFixed(1),
      avgWaist: (data.waist.reduce((a, b) => a + b, 0) / data.count).toFixed(1),
      avgHip: (data.hip.reduce((a, b) => a + b, 0) / data.count).toFixed(1)
    }));

    // Return plain object with CORS headers
    return new Response(JSON.stringify({
      success: true,
      data: formattedData,
      analytics: {
        totalOrders: submissions.length,
        uniqueCustomers: new Set(submissions.map(s => s.customerName)).size,
        sizeDistribution,
        sizeAnalytics: analytics,
        mostPopularSize: analytics.length > 0 
          ? analytics.reduce((prev, current) => (prev.count > current.count) ? prev : current).size 
          : 'N/A'
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });

  } catch (error) {
    console.error("Error fetching measurements:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
      analytics: null
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

