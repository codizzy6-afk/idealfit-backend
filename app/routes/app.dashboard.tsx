import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useState, useEffect } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Get shop info from session
  const { session } = await authenticate.admin(request);
  
  return { 
    shop: session?.shop || "Unknown",
    // You can add more initial data here
  };
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dashboard initialization
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <s-page heading="IdealFit Dashboard">
        <s-section>
          <s-text-field loading />
        </s-section>
      </s-page>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top Navigation */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937' }}>
          IdealFit Dashboard
        </h1>
      </div>

      {/* Tab Navigation */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 2rem',
        display: 'flex',
        gap: '1rem'
      }}>
        {['analytics', 'customers', 'size-chart', 'billing'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeTab === tab ? '#1e40af' : 'transparent',
              color: activeTab === tab ? 'white' : '#6b7280',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 600,
              textTransform: 'capitalize'
            }}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ padding: '2rem' }}>
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'customers' && <CustomersTab />}
        {activeTab === 'size-chart' && <SizeChartTab />}
        {activeTab === 'billing' && <BillingTab />}
      </div>
    </div>
  );
}

// Tab Components
function AnalyticsTab() {
  return (
    <div>
      <s-page heading="Analytics">
        <s-section heading="Overview">
          <s-paragraph>
            Analytics and insights coming soon. This will display:
          </s-paragraph>
          <s-unordered-list>
            <s-list-item>Size distribution across orders</s-list-item>
            <s-list-item>Average measurements per size</s-list-item>
            <s-list-item>Production priority insights</s-list-item>
            <s-list-item>Recommendation patterns</s-list-item>
          </s-unordered-list>
        </s-section>
      </s-page>
    </div>
  );
}

function CustomersTab() {
  return (
    <div>
      <s-page heading="Customer Database">
        <s-section heading="Customer Management">
          <s-paragraph>
            Customer database and management features coming soon. This will display:
          </s-paragraph>
          <s-unordered-list>
            <s-list-item>All customers with measurements</s-list-item>
            <s-list-item>Search and filter functionality</s-list-item>
            <s-list-item>Export to Excel</s-list-item>
            <s-list-item>Date range filtering</s-list-item>
          </s-unordered-list>
        </s-section>
      </s-page>
    </div>
  );
}

function SizeChartTab() {
  return (
    <div>
      <s-page heading="Size Chart Management">
        <s-section heading="Configure Size Chart">
          <s-paragraph>
            Editable size chart management coming soon. This will allow merchants to:
          </s-paragraph>
          <s-unordered-list>
            <s-list-item>Add/remove sizes</s-list-item>
            <s-list-item>Edit bust, waist, hip measurements</s-list-item>
            <s-list-item>Convert between inches and centimeters</s-list-item>
            <s-list-item>Save and sync with product pages</s-list-item>
          </s-unordered-list>
        </s-section>
      </s-page>
    </div>
  );
}

function BillingTab() {
  return (
    <div>
      <s-page heading="Billing & Payments">
        <s-section heading="Billing Information">
          <s-paragraph>
            Billing and payment management coming soon. This will include:
          </s-paragraph>
          <s-unordered-list>
            <s-list-item>Three-tier pricing (Starter, Professional, Enterprise)</s-list-item>
            <s-list-item>Automatic monthly billing based on orders</s-list-item>
            <s-list-item>Payment gateway integration (Razorpay, Stripe)</s-list-item>
            <s-list-item>Invoice generation and history</s-list-item>
          </s-unordered-list>
        </s-section>
      </s-page>
    </div>
  );
}

export function ErrorBoundary() {
  return boundary.error({ error: Error("Dashboard Error") });
}
