# 💳 Payment Integration Setup Guide

## 🎉 Completed Features
- ✅ Stripe Checkout integration
- ✅ Razorpay Checkout integration  
- ✅ Payment webhook handlers
- ✅ Invoice tracking in database
- ✅ Payment buttons in Billing tab

## 🔧 Setup Instructions

### 1. Stripe Setup

#### Create Stripe Account
1. Go to https://stripe.com and sign up
2. Navigate to **Developers > API keys**
3. Copy your **Secret Key** (starts with `sk_`)

#### Add Environment Variables
In your Render dashboard, add:
```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # Optional for production
```

#### Configure Stripe Webhook
1. Go to **Developers > Webhooks** in Stripe dashboard
2. Click **Add endpoint**
3. Set URL: `https://ideal-fit-app1.onrender.com/api/payments/webhook`
4. Select events: `checkout.session.completed`
5. Copy the **Signing secret** and add to `STRIPE_WEBHOOK_SECRET`

### 2. Razorpay Setup

#### Create Razorpay Account
1. Go to https://razorpay.com and sign up
2. Navigate to **Settings > API Keys**
3. Generate and copy your **Key ID** and **Key Secret**

#### Add Environment Variables
In your Render dashboard, add:
```
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxx  # Optional for production
```

#### Configure Razorpay Webhook
1. Go to **Settings > Webhooks** in Razorpay dashboard
2. Click **Create Webhook**
3. Set URL: `https://ideal-fit-app1.onrender.com/api/payments/webhook`
4. Select events: `payment.captured`
5. Copy the **Webhook Secret** and add to `RAZORPAY_WEBHOOK_SECRET`

### 3. Testing

#### Test Mode
For testing, use **test keys**:
- Stripe: Keys starting with `sk_test_`
- Razorpay: Test mode keys from your dashboard

#### Test Payments
1. Open your merchant dashboard
2. Navigate to **Billing** tab
3. Click **Pay with Stripe** or **Pay with Razorpay**
4. Use test cards:
   - Stripe: `4242 4242 4242 4242` (any CVV, future exp date)
   - Razorpay: Use Razorpay test cards from their docs

### 4. Production Deployment

#### Switch to Live Keys
1. Replace test keys with live keys in Render env vars
2. Redeploy your application
3. Test with real payment methods
4. Monitor webhook logs in both dashboards

## 📊 How It Works

### Payment Flow
1. Merchant clicks **Pay with Stripe/Razorpay** in dashboard
2. Frontend calls `/api/payments/stripe` or `/api/payments/razorpay`
3. Backend creates Checkout session/order with payment gateway
4. User completes payment on gateway
5. Gateway sends webhook to `/api/payments/webhook`
6. Backend updates invoice status in database
7. Dashboard refreshes showing payment status

### Invoice Tracking
- All invoices stored in `Invoice` model
- Fields: `id`, `invoiceNumber`, `status`, `paymentMethod`, `paymentId`, `paidAt`
- Status can be: `pending`, `paid`, `overdue`

## 🔒 Security Notes

1. **Never commit API keys** to version control
2. Use environment variables for all secrets
3. Enable webhook signature verification in production
4. Use HTTPS for all webhook URLs
5. Keep webhook secrets secure

## 📝 Support

- Stripe Docs: https://stripe.com/docs
- Razorpay Docs: https://razorpay.com/docs
- Check Render logs for webhook debugging
- Use Stripe/Razorpay dashboard webhook logs for troubleshooting

## ✨ What's Next?

Optional enhancements:
- PDF invoice generation
- Email notifications
- Recurring subscription support
- Payment retry logic
- Refund handling

