import type { ActionFunctionArgs } from "react-router";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const payload = await request.json();
    console.log('📦 Order webhook received:', payload.id);

    // Extract order data
    const order = payload;
    const customer = order.customer;
    const lineItems = order.line_items || [];
    const attributes = order.attributes || [];

    // Check if this order has measurement data
    let measurementData = null;
    
    // Look for measurement attributes
    attributes.forEach(attr => {
      if (attr.name && attr.name.startsWith('_measurement_')) {
        if (!measurementData) measurementData = {};
        
        if (attr.name === '_measurement_bust') {
          measurementData.bust = parseFloat(attr.value.replace('"', ''));
        } else if (attr.name === '_measurement_waist') {
          measurementData.waist = parseFloat(attr.value.replace('"', ''));
        } else if (attr.name === '_measurement_hip') {
          measurementData.hip = parseFloat(attr.value.replace('"', ''));
        } else if (attr.name === '_recommended_size') {
          measurementData.recommendedSize = attr.value;
        }
      }
    });

    // If we found measurement data, save it to database
    if (measurementData && measurementData.bust && measurementData.waist && measurementData.hip) {
      const customerName = customer ? 
        `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 
        customer.email || 
        'Anonymous' : 'Anonymous';

      const submission = await db.submission.create({
        data: {
          shop: order.shop_domain || 'unknown',
          customerName: customerName,
          productId: lineItems[0]?.product_id?.toString() || null,
          bust: measurementData.bust,
          waist: measurementData.waist,
          hip: measurementData.hip,
          recommendedSize: measurementData.recommendedSize || 'N/A',
          orderId: order.name || order.id?.toString() || null,
          date: new Date(order.created_at || new Date())
        }
      });

      console.log('✅ Measurement data saved:', {
        id: submission.id,
        customer: customerName,
        measurements: measurementData,
        orderId: order.name
      });
    } else {
      console.log('ℹ️ No measurement data found in order attributes');
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('❌ Error processing order webhook:', error);
    return new Response('Error', { status: 500 });
  }
};







