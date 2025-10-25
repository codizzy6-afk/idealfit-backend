import { useState, useEffect } from "react";

export default function TestDashboard() {
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
          IdealFit Dashboard - Test Mode
        </h1>
        <div style={{ color: '#10b981', fontWeight: 600 }}>
          ✅ App is Running Successfully!
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
            <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Analytics Dashboard</h2>
            <p style={{ color: '#6b7280' }}>Analytics data will be displayed here once OAuth is configured.</p>
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
              <strong>Status:</strong> App is running successfully! OAuth configuration needed for full functionality.
            </div>
          </div>
        )}
        
        {activeTab === 'customers' && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Customer Database</h2>
            <p style={{ color: '#6b7280' }}>Customer data will be displayed here once OAuth is configured.</p>
          </div>
        )}
        
        {activeTab === 'size-chart' && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Size Chart Management</h2>
            <p style={{ color: '#6b7280' }}>Size chart editor will be available here once OAuth is configured.</p>
          </div>
        )}
        
        {activeTab === 'billing' && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Billing Information</h2>
            <p style={{ color: '#6b7280' }}>Billing details will be displayed here once OAuth is configured.</p>
          </div>
        )}
      </div>
    </div>
  );
}
