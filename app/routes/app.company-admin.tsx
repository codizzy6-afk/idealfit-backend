import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

interface Merchant {
  id: string;
  shopDomain: string;
  username: string;
  email: string | null;
  createdAt: Date;
  submissionsCount: number;
}

interface Stats {
  totalMerchants: number;
  totalSubmissions: number;
  totalInvoices: number;
  totalRevenue: string;
}

export default function CompanyAdmin() {
  const { apiKey } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState('overview');
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [merchantsRes, statsRes] = await Promise.all([
        fetch('/api/admin?action=getAllMerchants'),
        fetch('/api/admin?action=getStats')
      ]);

      const merchantsData = await merchantsRes.json();
      const statsData = await statsRes.json();

      if (merchantsData.success) setMerchants(merchantsData.data);
      if (statsData.success) setStats(statsData.data);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Dashboard will be loaded here */}
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚧 Company Admin Dashboard</h1>
        <p style={{ color: '#666' }}>Building modern company admin dashboard...</p>
        
        {loading ? (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'inline-block', padding: '1rem 2rem', background: '#e0e7ff', borderRadius: '8px' }}>
              ⏳ Loading...
            </div>
          </div>
        ) : stats && (
          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <StatCard title="Total Merchants" value={stats.totalMerchants} color="#3b82f6" />
            <StatCard title="Total Submissions" value={stats.totalSubmissions} color="#10b981" />
            <StatCard title="Total Invoices" value={stats.totalInvoices} color="#f59e0b" />
            <StatCard title="Total Revenue" value={`$${stats.totalRevenue}`} color="#ef4444" />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: any; color: string }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: '700', color }}>{value}</div>
    </div>
  );
}

