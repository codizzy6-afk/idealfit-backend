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
      try {
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
          try {
            const submissionsCount = await db.submission.count({
              where: { shop: merchant.shopDomain }
            });

            return {
              id: merchant.id,
              shopDomain: merchant.shopDomain,
              username: merchant.username,
              email: merchant.email,
              createdAt: merchant.createdAt.toISOString(),
              updatedAt: merchant.updatedAt.toISOString(),
              submissionsCount,
            };
          } catch (error) {
            console.error(`Error getting stats for merchant ${merchant.id}:`, error);
            return {
              id: merchant.id,
              shopDomain: merchant.shopDomain,
              username: merchant.username,
              email: merchant.email,
              createdAt: merchant.createdAt.toISOString(),
              updatedAt: merchant.updatedAt.toISOString(),
              submissionsCount: 0,
            };
          }
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
      } catch (error) {
        console.error('Error fetching merchants:', error);
        return new Response(JSON.stringify({
          success: true,
          data: []
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // Get platform stats
    if (action === "getStats") {
      try {
        const totalMerchants = await db.merchant.count().catch(() => 0);
        const totalSubmissions = await db.submission.count().catch(() => 0);
        const totalInvoices = await db.invoice.count().catch(() => 0);
        
        // Get revenue stats
        let totalRevenue = 0;
        try {
          const paidInvoices = await db.invoice.aggregate({
            where: { status: 'paid' },
            _sum: { total: true }
          });
          totalRevenue = paidInvoices._sum.total || 0;
        } catch (error) {
          console.error('Error calculating revenue:', error);
          totalRevenue = 0;
        }

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
      } catch (error) {
        console.error('Error in getStats:', error);
        return new Response(JSON.stringify({
          success: true,
          data: {
            totalMerchants: 0,
            totalSubmissions: 0,
            totalInvoices: 0,
            totalRevenue: '0.00',
          }
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // Get submissions data
    if (action === "getSubmissions") {
      try {
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

        // Serialize dates to strings
        const serializedSubmissions = submissions.map(sub => ({
          ...sub,
          date: sub.date.toISOString(),
          createdAt: sub.createdAt.toISOString(),
        }));

        return new Response(JSON.stringify({
          success: true,
          data: serializedSubmissions
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (error) {
        console.error('Error fetching submissions:', error);
        return new Response(JSON.stringify({
          success: true,
          data: []
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // Get billing data
    if (action === "getBilling") {
      try {
        const invoices = await db.invoice.findMany({
          orderBy: {
            createdAt: 'desc'
          },
          take: 50
        });

        // Serialize dates to strings
        const serializedInvoices = invoices.map(inv => ({
          ...inv,
          createdAt: inv.createdAt.toISOString(),
          updatedAt: inv.updatedAt.toISOString(),
          paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
          dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
        }));

        return new Response(JSON.stringify({
          success: true,
          data: serializedInvoices
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (error) {
        console.error('Error fetching invoices:', error);
        return new Response(JSON.stringify({
          success: true,
          data: []
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
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

