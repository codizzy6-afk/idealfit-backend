import { useState } from "react";

export async function loader() {
  return { timestamp: Date.now() };
}

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('analytics');

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
          IdealFit Dashboard Preview
        </h1>
        <div style={{ color: '#10b981', fontWeight: 600 }}>
          ✅ App Running Successfully
        </div>
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
        {activeTab === 'analytics' && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>📊 Analytics Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Total Orders</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>0</p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Size Recommendations</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>0</p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Customer Satisfaction</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>0%</p>
              </div>
            </div>
            <p style={{ color: '#6b7280' }}>Real-time analytics will be displayed here once OAuth is configured.</p>
          </div>
        )}
        
        {activeTab === 'customers' && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>👥 Customer Database</h2>
            <div style={{ marginBottom: '1rem' }}>
              <button style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#1e40af', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                marginRight: '0.5rem'
              }}>
                Export Data
              </button>
              <button style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#6b7280', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px'
              }}>
                Filter
              </button>
            </div>
            <p style={{ color: '#6b7280' }}>Customer data will be displayed here once OAuth is configured.</p>
          </div>
        )}
        
        {activeTab === 'size-chart' && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>📏 Size Chart Management</h2>
            <div style={{ marginBottom: '1rem' }}>
              <button style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#10b981', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                marginRight: '0.5rem'
              }}>
                Add Size
              </button>
              <button style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#f59e0b', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                marginRight: '0.5rem'
              }}>
                Edit
              </button>
              <button style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#ef4444', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px'
              }}>
                Delete
              </button>
            </div>
            <p style={{ color: '#6b7280' }}>Size chart editor will be available here once OAuth is configured.</p>
          </div>
        )}
        
        {activeTab === 'billing' && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>💳 Billing Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Current Plan</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>Starter</p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Monthly Cost</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>$0.00</p>
              </div>
            </div>
            <button style={{ 
              padding: '0.75rem 1.5rem', 
              backgroundColor: '#1e40af', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              fontWeight: '600'
            }}>
              Make Payment
            </button>
            <p style={{ color: '#6b7280', marginTop: '1rem' }}>Billing details will be displayed here once OAuth is configured.</p>
          </div>
        )}
      </div>
    </div>
  );
}
