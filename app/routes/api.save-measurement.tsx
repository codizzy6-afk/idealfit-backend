import type { ActionFunctionArgs } from "react-router";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
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
      shop 
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

    // Save to database
    const submission = await db.submission.create({
      data: {
        shop: shop || 'idealfit-2.myshopify.com',
        customerName: customerName || 'Anonymous',
        productId: productId?.toString() || null,
        bust: parseFloat(bust),
        waist: parseFloat(waist),
        hip: parseFloat(hip),
        recommendedSize: recommendedSize || 'N/A',
        orderId: orderId || null,
        date: new Date()
      }
    });

    console.log('✅ Measurement saved:', {
      id: submission.id,
      customer: customerName,
      measurements: { bust, waist, hip },
      size: recommendedSize
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Measurement saved successfully',
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
};

// Handle OPTIONS for CORS preflight
export const OPTIONS = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};

// Handle GET requests for testing
export const loader = async ({ request }: ActionFunctionArgs) => {
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

  // Call the action function
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

  return action({ request: mockRequest });
};







