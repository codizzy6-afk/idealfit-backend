import type { LoaderFunctionArgs } from "react-router";
import db from "../db.server";
import bcrypt from "bcryptjs";

// Helper function to create sample data
async function createSampleData() {
  console.log('🚀 Creating sample data for Company Admin Dashboard...\n');

  try {
    // 1. Create sample merchants
    console.log('📦 Creating sample merchants...');
    const merchants = [
      {
        shopDomain: 'fashion-store.myshopify.com',
        username: 'fashionstore',
        email: 'owner@fashionstore.com',
        password: 'password123'
      },
      {
        shopDomain: 'boutique-shop.myshopify.com',
        username: 'boutique',
        email: 'admin@boutiqueshop.com',
        password: 'password123'
      },
      {
        shopDomain: 'style-co.myshopify.com',
        username: 'styleco',
        email: 'contact@styleco.com',
        password: 'password123'
      },
      {
        shopDomain: 'trendy-wear.myshopify.com',
        username: 'trendywear',
        email: 'hello@trendywear.com',
        password: 'password123'
      },
      {
        shopDomain: 'elite-fashion.myshopify.com',
        username: 'elitefashion',
        email: 'info@elitefashion.com',
        password: 'password123'
      }
    ];

    const createdMerchants = [];
    for (const merchant of merchants) {
      // Check if merchant already exists
      const existing = await db.merchant.findUnique({
        where: { shopDomain: merchant.shopDomain }
      });

      if (existing) {
        console.log(`  ⏭️  Merchant ${merchant.shopDomain} already exists, skipping...`);
        createdMerchants.push(existing);
      } else {
        const passwordHash = await bcrypt.hash(merchant.password, 10);
        const created = await db.merchant.create({
          data: {
            shopDomain: merchant.shopDomain,
            username: merchant.username,
            email: merchant.email,
            passwordHash: passwordHash
          }
        });
        createdMerchants.push(created);
        console.log(`  ✅ Created merchant: ${merchant.shopDomain}`);
      }
    }

    // 2. Create sample submissions
    console.log('\n📋 Creating sample submissions...');
    const submissionSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
    const customerNames = [
      'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim',
      'Jessica Williams', 'James Brown', 'Maria Garcia', 'Robert Taylor',
      'Lisa Anderson', 'Daniel Martinez', 'Jennifer Lee', 'Christopher Davis',
      'Amanda White', 'Matthew Harris', 'Ashley Clark'
    ];

    const createdSubmissions = [];
    for (let i = 0; i < 25; i++) {
      const merchant = createdMerchants[Math.floor(Math.random() * createdMerchants.length)];
      const size = submissionSizes[Math.floor(Math.random() * submissionSizes.length)];
      const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
      
      // Generate realistic measurements based on size
      const sizeRanges: Record<string, { bust: number[], waist: number[], hip: number[] }> = {
        'XS': { bust: [30, 32], waist: [24, 26], hip: [34, 36] },
        'S': { bust: [32, 34], waist: [26, 28], hip: [36, 38] },
        'M': { bust: [34, 36], waist: [28, 30], hip: [38, 40] },
        'L': { bust: [36, 38], waist: [30, 32], hip: [40, 42] },
        'XL': { bust: [38, 40], waist: [32, 34], hip: [42, 44] },
        'XXL': { bust: [40, 42], waist: [34, 36], hip: [44, 46] },
        '3XL': { bust: [42, 44], waist: [36, 38], hip: [46, 48] }
      };

      const range = sizeRanges[size];
      const bust = parseFloat((Math.random() * (range.bust[1] - range.bust[0]) + range.bust[0]).toFixed(1));
      const waist = parseFloat((Math.random() * (range.waist[1] - range.waist[0]) + range.waist[0]).toFixed(1));
      const hip = parseFloat((Math.random() * (range.hip[1] - range.hip[0]) + range.hip[0]).toFixed(1));

      // Random date in the last 3 months
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 90));

      const submission = await db.submission.create({
        data: {
          shop: merchant.shopDomain,
          customerName: customerName,
          bust: bust,
          waist: waist,
          hip: hip,
          recommendedSize: size,
          productId: `product-${Math.floor(Math.random() * 1000)}`,
          orderId: `order-${Math.floor(Math.random() * 10000)}`,
          date: date
        }
      });
      createdSubmissions.push(submission);
    }

    // 3. Create sample invoices
    console.log('\n💰 Creating sample invoices...');
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      months.push(date.toISOString().slice(0, 7)); // YYYY-MM format
    }

    const statuses = ['pending', 'paid', 'overdue'];
    const paymentMethods = ['razorpay', 'stripe', 'bank_transfer'];
    const createdInvoices = [];

    for (const merchant of createdMerchants) {
      for (const month of months) {
        const orderCount = Math.floor(Math.random() * 50) + 10;
        const pricePerOrder = 0.12;
        const total = orderCount * pricePerOrder;
        const totalINR = total * 83; // Approximate USD to INR rate
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const paymentMethod = status === 'paid' ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)] : null;
        
        const invoiceNumber = `INV-${month.replace('-', '')}-${merchant.shopDomain.split('.')[0].substring(0, 3).toUpperCase()}`;
        
        // Check if invoice already exists
        const existing = await db.invoice.findUnique({
          where: { invoiceNumber }
        });

        if (existing) {
          console.log(`  ⏭️  Invoice ${invoiceNumber} already exists, skipping...`);
          continue;
        }

        const paidAt = status === 'paid' ? new Date() : null;
        const dueDate = new Date(month + '-01');
        dueDate.setMonth(dueDate.getMonth() + 1);
        dueDate.setDate(15); // Due on 15th of next month

        const invoice = await db.invoice.create({
          data: {
            shop: merchant.shopDomain,
            invoiceNumber: invoiceNumber,
            month: month,
            orderCount: orderCount,
            pricePerOrder: pricePerOrder,
            total: total,
            totalINR: totalINR,
            currency: 'USD',
            tier: 'Starter',
            status: status,
            paymentMethod: paymentMethod,
            paymentId: status === 'paid' ? `payment-${Math.floor(Math.random() * 100000)}` : null,
            paidAt: paidAt,
            dueDate: dueDate
          }
        });
        createdInvoices.push(invoice);
      }
    }

    return {
      success: true,
      message: 'Sample data created successfully',
      data: {
        merchants: createdMerchants.length,
        submissions: createdSubmissions.length,
        invoices: createdInvoices.length
      }
    };
  } catch (error: any) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
}

// API endpoint - GET request to create sample data
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log('📊 Sample data creation API called');
    
    const result = await createSampleData();
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error: any) {
    console.error('❌ Sample data creation error:', error);
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
