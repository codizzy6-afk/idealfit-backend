import type { LoaderFunctionArgs } from "react-router";
import { cache, analyticsCacheKey } from "../utils/cache.server";

// Analytics API endpoint - calculates statistics from orders
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
    const SHOPIFY_STORE = process.env.SHOPIFY_STORE || "idealfit-2.myshopify.com";
    
    if (!SHOPIFY_ACCESS_TOKEN) {
      throw new Error("SHOPIFY_ACCESS_TOKEN not configured");
    }

    // Get filter parameters from URL
    const url = new URL(request.url);
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');
    
    // Build cache key including filters
    const cacheKey = analyticsCacheKey(SHOPIFY_STORE) + `:${dateFrom || ''}:${dateTo || ''}:${month || ''}:${year || ''}`;
    
    // Simple per-shop caching for 2 minutes
    const cached = cache.get<any>(cacheKey);
    const forceRefresh = url.searchParams.get('refresh') === 'true';
    
    if (cached && !forceRefresh) {
      return new Response(JSON.stringify({ success: true, data: cached }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Fetch orders from Shopify
    const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2025-01/orders.json?limit=250&status=any`, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    const orders = data.orders || [];

    // Process analytics
    const sizeDistribution: { [key: string]: { count: number; bust: number[]; waist: number[]; hip: number[]; totalOrders: number } } = {};
    const monthlyTrends: { [key: string]: number } = {};
    const ordersWithMeasurements: any[] = [];

    // Filter orders by date if filters are provided
    let filteredOrders = [...orders];
    
    if (dateFrom || dateTo || month || year) {
      filteredOrders = orders.filter((order: any) => {
        if (!order.created_at) return false;
        
        const orderDate = new Date(order.created_at);
        const orderDateStr = order.created_at.substring(0, 10); // YYYY-MM-DD
        const orderMonth = order.created_at.substring(5, 7); // MM
        const orderYear = order.created_at.substring(0, 4); // YYYY
        
        // Check date range
        if (dateFrom && orderDateStr < dateFrom) return false;
        if (dateTo && orderDateStr > dateTo) return false;
        
        // Check month
        if (month && orderMonth !== month) return false;
        
        // Check year
        if (year && orderYear !== year) return false;
        
        return true;
      });
    }
    
    filteredOrders.forEach((order: any) => {
      // Extract measurements
      const measurements: any = {};
      
      if (order.note_attributes) {
        order.note_attributes.forEach((attr: any) => {
          if (attr.name && attr.value) {
            if (attr.name.includes('measurement_bust')) measurements.bust = attr.value;
            if (attr.name.includes('measurement_waist')) measurements.waist = attr.value;
            if (attr.name.includes('measurement_hip')) measurements.hip = attr.value;
            if (attr.name.includes('recommended_size')) measurements.size = attr.value;
          }
        });
      }

      // Check line_items for cart attributes
      if (order.line_items) {
        order.line_items.forEach((item: any) => {
          if (item.properties && Array.isArray(item.properties)) {
            item.properties.forEach((prop: any) => {
              if (prop.name && prop.value) {
                if (prop.name.includes('measurement_bust')) measurements.bust = prop.value;
                if (prop.name.includes('measurement_waist')) measurements.waist = prop.value;
                if (prop.name.includes('measurement_hip')) measurements.hip = prop.value;
                if (prop.name.includes('recommended_size')) measurements.size = prop.value;
              }
            });
          }
        });
      }

      // Process size distribution
      if (measurements.size) {
        const size = measurements.size;
        if (!sizeDistribution[size]) {
          sizeDistribution[size] = { count: 0, bust: [], waist: [], hip: [], totalOrders: 0 };
        }
        sizeDistribution[size].count++;
        sizeDistribution[size].totalOrders++;
        
        if (measurements.bust) sizeDistribution[size].bust.push(parseFloat(measurements.bust));
        if (measurements.waist) sizeDistribution[size].waist.push(parseFloat(measurements.waist));
        if (measurements.hip) sizeDistribution[size].hip.push(parseFloat(measurements.hip));
      }

      // Monthly trends
      const orderMonth = order.created_at?.substring(0, 7); // YYYY-MM
      if (orderMonth) {
        monthlyTrends[orderMonth] = (monthlyTrends[orderMonth] || 0) + 1;
      }

      // Store order with measurements
      if (measurements.size || measurements.bust || measurements.waist || measurements.hip) {
        ordersWithMeasurements.push({
          orderNumber: order.order_number,
          createdAt: order.created_at,
          measurements
        });
      }
    });

    // Calculate averages for each size
    const sizeStats = Object.keys(sizeDistribution).map(size => {
      const data = sizeDistribution[size];
      const avgBust = data.bust.length > 0 ? (data.bust.reduce((a, b) => a + b, 0) / data.bust.length).toFixed(1) : 0;
      const avgWaist = data.waist.length > 0 ? (data.waist.reduce((a, b) => a + b, 0) / data.waist.length).toFixed(1) : 0;
      const avgHip = data.hip.length > 0 ? (data.hip.reduce((a, b) => a + b, 0) / data.hip.length).toFixed(1) : 0;
      const percentage = (data.count / ordersWithMeasurements.length * 100).toFixed(1);
      
      return {
        size,
        recommendations: data.count,
        percentage: parseFloat(percentage),
        avgBust: parseFloat(avgBust),
        avgWaist: parseFloat(avgWaist),
        avgHip: parseFloat(avgHip),
        productionPriority: data.count > 50 ? 'High' : data.count > 20 ? 'Medium' : 'Low'
      };
    });

    // Sort by count descending
    sizeStats.sort((a, b) => b.recommendations - a.recommendations);

    // Calculate KPIs (use filteredOrders instead of orders)
    const totalOrders = filteredOrders.length;
    const ordersWithRecommendations = ordersWithMeasurements.length;
    const conversionRate = totalOrders > 0 ? ((ordersWithRecommendations / totalOrders) * 100).toFixed(1) : '0.0';
    
    // Most popular size
    const mostPopularSize = sizeStats.length > 0 ? sizeStats[0] : null;

    // Calculate total revenue (sum of all filtered order totals)
    const totalRevenue = filteredOrders.reduce((sum, order: any) => {
      return sum + (parseFloat(order.total_price) || 0);
    }, 0);

    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get current month's order count (use filteredOrders)
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthOrders = filteredOrders.filter((order: any) => {
      if (!order.created_at) return false;
      const orderMonth = order.created_at.substring(0, 7); // YYYY-MM
      return orderMonth === currentMonth;
    });

    const result = {
      success: true,
      data: {
        kpis: {
          totalOrders,
          ordersWithRecommendations,
          conversionRate: parseFloat(conversionRate),
          mostPopularSize: mostPopularSize?.size || 'N/A',
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
          currentMonthOrders: currentMonthOrders.length
        },
        sizeDistribution: sizeStats,
        monthlyTrends: Object.keys(monthlyTrends).sort().map(month => ({
          month,
          count: monthlyTrends[month]
        }))
      }
    };

    // cache for 2 minutes with the combined key
    cache.set(cacheKey, result.data, 2 * 60 * 1000);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    console.error("Error fetching analytics:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
