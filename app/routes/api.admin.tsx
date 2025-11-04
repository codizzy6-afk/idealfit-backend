import type { LoaderFunctionArgs } from "react-router";
import db from "../db.server";

// Company admin API endpoint
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log('📊 Admin API called:', request.url);
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    console.log('📊 Action:', action);

    // Get all merchants
    if (action === "getAllMerchants") {
      const merchants = await db.merchant.findMany({
        select: {
          id: true,
          shopDomain: true,
          username: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Get stats for each merchant
      const merchantsWithStats = await Promise.all(
        merchants.map(async (merchant) => {
          const submissionsCount = await db.submission.count({
            where: { shop: merchant.shopDomain }
          });

          return {
            ...merchant,
            submissionsCount,
          };
        })
      );

      return new Response(JSON.stringify({
        success: true,
        data: merchantsWithStats
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Get platform stats
    if (action === "getStats") {
      const totalMerchants = await db.merchant.count();
      const totalSubmissions = await db.submission.count();
      const totalInvoices = await db.invoice.count();
      
      // Get revenue stats
      const paidInvoices = await db.invoice.aggregate({
        where: { status: 'paid' },
        _sum: { total: true }
      });

      const totalRevenue = paidInvoices._sum.total || 0;

      return new Response(JSON.stringify({
        success: true,
        data: {
          totalMerchants,
          totalSubmissions,
          totalInvoices,
          totalRevenue: totalRevenue.toFixed(2),
        }
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Get submissions data
    if (action === "getSubmissions") {
      const submissions = await db.submission.findMany({
        select: {
          id: true,
          shop: true,
          customerName: true,
          bust: true,
          waist: true,
          hip: true,
          recommendedSize: true,
          date: true,
          createdAt: true,
        },
        orderBy: {
          date: 'desc'
        },
        take: 100 // Limit for performance
      });

      return new Response(JSON.stringify({
        success: true,
        data: submissions
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Get billing data
    if (action === "getBilling") {
      const invoices = await db.invoice.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: 50
      });

      return new Response(JSON.stringify({
        success: true,
        data: invoices
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid action'
    }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: any) {
    console.error('❌ Admin API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

