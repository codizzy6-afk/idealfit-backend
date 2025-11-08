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

    // Get customers data (aggregated from submissions across all merchants)
    if (action === "getCustomers") {
      try {
        // Get all submissions with customer data
        const submissions = await db.submission.findMany({
          select: {
            id: true,
            shop: true,
            customerName: true,
            bust: true,
            waist: true,
            hip: true,
            recommendedSize: true,
            orderId: true,
            productId: true,
            date: true,
            createdAt: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            country: true,
          },
          orderBy: {
            date: 'desc'
          },
          take: 500 // Limit for performance
        });

        // Aggregate customers by name and shop (group submissions by customer)
        const customerMap = new Map<string, any>();

        submissions.forEach(sub => {
          const key = `${sub.shop}:${sub.customerName || 'Anonymous'}`;
          
          if (!customerMap.has(key)) {
            customerMap.set(key, {
              id: key,
              shop: sub.shop,
              customerName: sub.customerName || 'Anonymous',
              totalSubmissions: 0,
              latestSubmission: sub.date,
              latestSize: sub.recommendedSize,
              measurements: [],
              orders: [],
              email: sub.email || null,
              phone: sub.phone || null,
              address: sub.address || null,
              city: sub.city || null,
              state: sub.state || null,
              country: sub.country || null,
            });
          }

          const customer = customerMap.get(key)!;
          customer.totalSubmissions++;
          
          // Update latest submission date
          if (sub.date > customer.latestSubmission) {
            customer.latestSubmission = sub.date;
            customer.latestSize = sub.recommendedSize;
          }

          // Add measurement data
          customer.measurements.push({
            date: sub.date.toISOString(),
            bust: sub.bust,
            waist: sub.waist,
            hip: sub.hip,
            recommendedSize: sub.recommendedSize,
            productId: sub.productId,
            orderId: sub.orderId
          });

          // Track unique orders
          if (sub.orderId && !customer.orders.includes(sub.orderId)) {
            customer.orders.push(sub.orderId);
          }
        });

        // Convert map to array and calculate statistics
        const customers = Array.from(customerMap.values()).map(customer => {
          // Calculate average measurements
          const avgBust = customer.measurements.reduce((sum: number, m: any) => sum + m.bust, 0) / customer.measurements.length;
          const avgWaist = customer.measurements.reduce((sum: number, m: any) => sum + m.waist, 0) / customer.measurements.length;
          const avgHip = customer.measurements.reduce((sum: number, m: any) => sum + m.hip, 0) / customer.measurements.length;

          // Get most common size
          const sizeCounts: Record<string, number> = {};
          customer.measurements.forEach((m: any) => {
            sizeCounts[m.recommendedSize] = (sizeCounts[m.recommendedSize] || 0) + 1;
          });
          const mostCommonSize = Object.entries(sizeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || customer.latestSize;

          return {
            id: customer.id,
            shop: customer.shop,
            customerName: customer.customerName,
            totalSubmissions: customer.totalSubmissions,
            totalOrders: customer.orders.length,
            latestSubmission: customer.latestSubmission.toISOString(),
            latestSize: customer.latestSize,
            mostCommonSize: mostCommonSize,
            averageMeasurements: {
              bust: parseFloat(avgBust.toFixed(1)),
              waist: parseFloat(avgWaist.toFixed(1)),
              hip: parseFloat(avgHip.toFixed(1))
            },
            orders: customer.orders,
            contact: {
              email: customer.email,
              phone: customer.phone,
              address: customer.address,
              city: customer.city,
              state: customer.state,
              country: customer.country
            }
          };
        });

        // Sort by latest submission date
        customers.sort((a, b) => new Date(b.latestSubmission).getTime() - new Date(a.latestSubmission).getTime());

        return new Response(JSON.stringify({
          success: true,
          data: customers
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (error) {
        console.error('Error fetching customers:', error);
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
