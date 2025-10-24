import type { ActionFunctionArgs } from "react-router";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const data = await request.json();
    console.log('📏 Received size chart data:', data);

    const { 
      title, 
      chartData, 
      shop 
    } = data;

    // Validate required fields
    if (!chartData || !Array.isArray(chartData)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid chart data'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Save to database
    const sizeChart = await db.sizeChart.create({
      data: {
        shop: shop || 'idealfit-2.myshopify.com',
        title: title || 'Default Size Chart',
        chartData: JSON.stringify(chartData)
      }
    });

    console.log('✅ Size chart saved:', {
      id: sizeChart.id,
      title: sizeChart.title,
      shop: sizeChart.shop
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Size chart saved successfully',
      data: sizeChart
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Error saving size chart:', error);
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

// Handle GET requests for testing
export const loader = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || 'Test Chart';
  const shop = url.searchParams.get('shop') || 'idealfit-2.myshopify.com';
  
  const testChartData = [
    { size: 'XS', bust: 30, waist: 25, hip: 35 },
    { size: 'S', bust: 32, waist: 27, hip: 37 },
    { size: 'M', bust: 34, waist: 29, hip: 39 },
    { size: 'L', bust: 36, waist: 31, hip: 41 },
    { size: 'XL', bust: 38, waist: 33, hip: 43 },
    { size: 'XXL', bust: 40, waist: 35, hip: 45 }
  ];

  // Call the action function
  const mockRequest = new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      chartData: testChartData,
      shop
    })
  });

  return action({ request: mockRequest });
};







