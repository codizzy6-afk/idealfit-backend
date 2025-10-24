import type { ActionFunctionArgs } from "react-router";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    console.log('🧪 Adding test measurement data...');

    // Add some sample measurement data
    const testData = [
      {
        shop: 'idealfit-2.myshopify.com',
        customerName: 'John Doe',
        productId: '12345',
        bust: 36,
        waist: 28,
        hip: 38,
        recommendedSize: 'L',
        orderId: '#1001',
        date: new Date('2025-10-09')
      },
      {
        shop: 'idealfit-2.myshopify.com',
        customerName: 'Jane Smith',
        productId: '12346',
        bust: 34,
        waist: 26,
        hip: 36,
        recommendedSize: 'M',
        orderId: '#1002',
        date: new Date('2025-10-09')
      },
      {
        shop: 'idealfit-2.myshopify.com',
        customerName: 'Mike Johnson',
        productId: '12347',
        bust: 38,
        waist: 30,
        hip: 40,
        recommendedSize: 'XL',
        orderId: '#1003',
        date: new Date('2025-10-08')
      },
      {
        shop: 'idealfit-2.myshopify.com',
        customerName: 'Sarah Wilson',
        productId: '12348',
        bust: 32,
        waist: 24,
        hip: 34,
        recommendedSize: 'S',
        orderId: '#1004',
        date: new Date('2025-10-08')
      },
      {
        shop: 'idealfit-2.myshopify.com',
        customerName: 'Emily Davis',
        productId: '12349',
        bust: 34,
        waist: 29,
        hip: 39,
        recommendedSize: 'M',
        orderId: '#1005',
        date: new Date('2025-10-07')
      }
    ];

    // Clear existing test data first
    await db.submission.deleteMany({
      where: {
        shop: 'idealfit-2.myshopify.com'
      }
    });

    // Add test data
    const created = await Promise.all(
      testData.map(data => db.submission.create({ data }))
    );

    console.log(`✅ Added ${created.length} test measurements`);

    return new Response(JSON.stringify({
      success: true,
      message: `Added ${created.length} test measurements`,
      data: created
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Error adding test data:', error);
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

// Handle GET requests too
export const loader = async ({ request }: ActionFunctionArgs) => {
  return action({ request });
};







