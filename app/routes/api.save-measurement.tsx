import type { ActionFunctionArgs } from "react-router";
import db from "../db.server";

// Action function for POST requests
async function handleAction(request: Request) {
  try {
    const data = await request.json();
    console.log('📊 Received measurement data:', data);

    // Extract data
    const { 
      bust, 
      waist, 
      hip, 
      recommendedSize, 
      customerName, 
      productId, 
      orderId, 
      shop,
      unit
    } = data;

    // Validate required fields
    if (!bust || !waist || !hip) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required measurements'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Calculate recommended size if not provided
    let calculatedSize = recommendedSize;
    if (!calculatedSize) {
      try {
        // Fetch merchant size chart
        const shopDomain = shop || 'idealfit-2.myshopify.com';
        const sizeChart = await db.sizeChart.findFirst({
          where: { shop: shopDomain },
          orderBy: { updatedAt: 'desc' }
        });

        if (sizeChart && sizeChart.chartData) {
          const chartData = typeof sizeChart.chartData === 'string' 
            ? JSON.parse(sizeChart.chartData) 
            : sizeChart.chartData;
          
          const bustInches = unit === 'inches' ? parseFloat(bust) : parseFloat(bust) / 2.54;
          const waistInches = unit === 'inches' ? parseFloat(waist) : parseFloat(waist) / 2.54;
          const hipInches = unit === 'inches' ? parseFloat(hip) : parseFloat(hip) / 2.54;

          // Find first size where all measurements fit
          for (const size of chartData) {
            if (bustInches <= size.bust && waistInches <= size.waist && hipInches <= size.hip) {
              calculatedSize = size.size;
              break;
            }
          }

          // If no size fits, return "Custom Size"
          if (!calculatedSize) {
            calculatedSize = 'Custom Size';
          }
        }
      } catch (chartError) {
        console.error('Error calculating size:', chartError);
        calculatedSize = 'N/A';
      }
    }

    // Save to database
    const submission = await db.submission.create({
      data: {
        shop: shop || 'idealfit-2.myshopify.com',
        customerName: customerName || 'Anonymous',
        productId: productId?.toString() || null,
        bust: parseFloat(bust),
        waist: parseFloat(waist),
        hip: parseFloat(hip),
        recommendedSize: calculatedSize || 'N/A',
        orderId: orderId || null,
        date: new Date()
      }
    });

    console.log('✅ Measurement saved:', {
      id: submission.id,
      customer: customerName,
      measurements: { bust, waist, hip },
      size: calculatedSize
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Measurement saved successfully',
      recommendedSize: calculatedSize,
      data: submission
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Error saving measurement:', error);
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
}

// Export action and loader for React Router
export const action = async ({ request }: ActionFunctionArgs) => {
  return handleAction(request);
};

export const loader = async ({ request }: ActionFunctionArgs) => {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  // Handle GET requests for testing
  const url = new URL(request.url);
  const bust = url.searchParams.get('bust');
  const waist = url.searchParams.get('waist');
  const hip = url.searchParams.get('hip');
  const customerName = url.searchParams.get('customerName') || 'Test Customer';
  const productId = url.searchParams.get('productId') || '12345';
  const shop = url.searchParams.get('shop') || 'idealfit-2.myshopify.com';

  if (!bust || !waist || !hip) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Missing parameters: bust, waist, hip'
    }), { 
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Call the action function for GET requests
  const mockRequest = new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bust, waist, hip,
      recommendedSize: 'M', // Default for testing
      customerName,
      productId,
      shop
    })
  });

  return handleAction(mockRequest);
};




