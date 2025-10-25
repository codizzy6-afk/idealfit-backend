import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useState, useEffect, useLoaderData } from "react";
import { useFetcher } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Get shop info from session
  const { session } = await authenticate.admin(request);
  
  // Fetch initial analytics data
  let analyticsData = null;
  try {
    const analyticsResponse = await fetch(`${new URL(request.url).origin}/api/shopify-analytics?period=30d`);
    if (analyticsResponse.ok) {
      analyticsData = await analyticsResponse.json();
    }
  } catch (error) {
    console.error("Error fetching analytics:", error);
  }
  
  return { 
    shop: session?.shop || "Unknown",
    analyticsData,
  };
};

export default function Dashboard() {
  const { shop, analyticsData } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState('analytics');
  const fetcher = useFetcher<typeof loader>();
  const [period, setPeriod] = useState('30d');
  
  const data = fetcher.data?.analyticsData || analyticsData;

  useEffect(() => {
    // Fetch data when period changes
    fetcher.load(`/api/shopify-analytics?period=${period}`);
  }, [period]);

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
        {activeTab === 'analytics' && <AnalyticsTab data={data} period={period} setPeriod={setPeriod} />}
        {activeTab === 'customers' && <CustomersTab />}
        {activeTab === 'size-chart' && <SizeChartTab />}
        {activeTab === 'billing' && <BillingTab />}
      </div>
    </div>
  );
}

// Tab Components
function AnalyticsTab({ data, period, setPeriod }: { data: any, period: string, setPeriod: (p: string) => void }) {
  const summary = data?.data?.summary || {};
  const sizeDistribution = data?.data?.sizeDistribution || [];
  const topCustomers = data?.data?.topCustomers || [];
  const topProducts = data?.data?.topProducts || [];

  return (
    <div>
      <s-page heading="Analytics">
        {/* Period Selector */}
        <s-section heading="Time Period">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            {['7d', '30d', '90d', '1y'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '0.5rem 1rem',
                  border: period === p ? '2px solid #1e40af' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: period === p ? '#eff6ff' : 'white',
                  color: period === p ? '#1e40af' : '#6b7280',
                  cursor: 'pointer',
                  fontWeight: period === p ? 600 : 400
                }}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </s-section>

        {/* KPI Cards */}
        <s-section heading="Overview">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <KPICard title="Total Orders" value={summary.totalOrders || 0} icon="📦" />
            <KPICard title="Total Revenue" value={`$${summary.totalRevenue?.toFixed(2) || '0.00'}`} icon="💰" />
            <KPICard title="Customers" value={summary.uniqueCustomers || 0} icon="👥" />
            <KPICard title="Avg Order Value" value={`$${summary.averageOrderValue?.toFixed(2) || '0.00'}`} icon="📊" />
          </div>
        </s-section>

        {/* Size Distribution */}
        <s-section heading="Size Distribution">
          <div style={{ marginBottom: '2rem' }}>
            <SizeDistributionChart data={sizeDistribution} />
          </div>
          
          {/* Size Comparison Table */}
          {sizeDistribution.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Size Comparison & Production Insights</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>SIZE</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>RECOMMENDATIONS</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>PERCENTAGE</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>AVG BUST</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>AVG WAIST</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>AVG HIP</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>PRIORITY</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeDistribution.map((item: any, index: number) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{item.size}</td>
                      <td style={{ padding: '1rem' }}>{item.recommendations}</td>
                      <td style={{ padding: '1rem' }}>{item.percentage}%</td>
                      <td style={{ padding: '1rem' }}>{item.avgBust}"</td>
                      <td style={{ padding: '1rem' }}>{item.avgWaist}"</td>
                      <td style={{ padding: '1rem' }}>{item.avgHip}"</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: item.priority === 'HIGH' ? '#fee2e2' : '#fef3c7',
                          color: item.priority === 'HIGH' ? '#991b1b' : '#92400e'
                        }}>
                          {item.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </s-section>
      </s-page>
    </div>
  );
}

function CustomersTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    month: '',
    year: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/shopify-customers?limit=250');
      const data = await response.json();
      
      if (data.success && data.customers) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer: any) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const name = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase();
      const email = (customer.email || '').toLowerCase();
      const phone = (customer.phone || '').toLowerCase();
      
      if (!name.includes(searchLower) && !email.includes(searchLower) && !phone.includes(searchLower)) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const createdAt = new Date(customer.createdAt);
      if (filters.dateFrom && createdAt < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && createdAt > new Date(filters.dateTo)) return false;
    }

    // Month filter
    if (filters.month) {
      const month = new Date(customer.createdAt).getMonth() + 1;
      if (month.toString() !== filters.month) return false;
    }

    // Year filter
    if (filters.year) {
      const year = new Date(customer.createdAt).getFullYear().toString();
      if (year !== filters.year) return false;
    }

    return true;
  });

  const exportToExcel = () => {
    const csv = [
      ['Name', 'Email', 'Mobile', 'Address', 'City', 'State', 'Country', 'Bust', 'Waist', 'Hip', 'Size', 'Order ID'],
      ...filteredCustomers.map((customer: any) => {
        const address = customer.defaultAddress || {};
        // In real implementation, you'd extract measurements from order metafields
        return [
          `${customer.firstName} ${customer.lastName}`,
          customer.email || '',
          customer.phone || '',
          address.address1 || '',
          address.city || '',
          address.province || '',
          address.country || '',
          '', // bust
          '', // waist
          '', // hip
          '', // size
          customer.orders?.[0]?.name || ''
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <s-page heading="Customer Database">
        {/* Filters and Search */}
        <s-section heading="Filters & Search">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Search</label>
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Month</label>
              <select
                value={filters.month}
                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Year</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              >
                <option value="">All Years</option>
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ dateFrom: '', dateTo: '', month: '', year: '' });
              }}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Clear Filters
            </button>
            
            <button
              onClick={exportToExcel}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                background: '#10b981',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              📥 Export to Excel
            </button>
          </div>
        </s-section>

        {/* Customer Table */}
        <s-section heading={`Customer Database (${filteredCustomers.length} customers)`}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No customers found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Name</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Email</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Mobile</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Address</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>State</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Country</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer: any, index: number) => {
                    const address = customer.defaultAddress || {};
                    return (
                      <tr key={customer.id || index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{customer.firstName} {customer.lastName}</td>
                        <td style={{ padding: '1rem' }}>{customer.email || '-'}</td>
                        <td style={{ padding: '1rem' }}>{customer.phone || '-'}</td>
                        <td style={{ padding: '1rem' }}>{address.address1 || '-'}</td>
                        <td style={{ padding: '1rem' }}>{address.province || '-'}</td>
                        <td style={{ padding: '1rem' }}>{address.country || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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

// Helper Components
function KPICard({ title, value, icon }: { title: string, value: string | number, icon: string }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '2rem' }}>{icon}</span>
        <div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>{title}</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937' }}>{value}</div>
        </div>
      </div>
    </div>
  );
}

function SizeDistributionChart({ data }: { data: any[] }) {
  const maxRecommendations = Math.max(...data.map((item: any) => item.recommendations), 1);
  
  return (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Size Distribution</h3>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
        {data.map((item: any, index: number) => {
          const height = (item.recommendations / maxRecommendations) * 300;
          const percentage = parseFloat(item.percentage || '0');
          
          return (
            <div key={index} style={{ flex: 1, textAlign: 'center' }}>
              <div
                style={{
                  height: `${height}px`,
                  maxHeight: '300px',
                  backgroundColor: percentage > 20 ? '#10b981' : percentage > 10 ? '#f59e0b' : '#ef4444',
                  borderRadius: '8px 8px 0 0',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  padding: '0.5rem',
                  position: 'relative',
                  background: `linear-gradient(180deg, ${
                    percentage > 20 ? '#10b981' : percentage > 10 ? '#f59e0b' : '#ef4444'
                  } 0%, ${
                    percentage > 20 ? '#059669' : percentage > 10 ? '#d97706' : '#dc2626'
                  } 100%)`
                }}
              >
                <span style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem' }}>
                  {item.recommendations}
                </span>
              </div>
              <div style={{ marginTop: '0.5rem', fontWeight: 600, fontSize: '1.125rem' }}>
                {item.size}
              </div>
              <div style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>
                {item.percentage}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return boundary.error({ error: Error("Dashboard Error") });
}
