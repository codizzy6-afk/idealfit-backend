export async function loader() {
  return { 
    status: "success",
    message: "IdealFit App is running!",
    timestamp: Date.now()
  };
}

export default function HealthCheck() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem'
        }}>
          ✅
        </div>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 600, 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          IdealFit App is Running!
        </h1>
        <p style={{ 
          color: '#6b7280',
          fontSize: '1.125rem',
          marginBottom: '2rem'
        }}>
          Your app is successfully deployed and running on Render.
        </p>
        <div style={{
          backgroundColor: '#d1fae5',
          border: '1px solid #10b981',
          borderRadius: '6px',
          padding: '1rem',
          marginTop: '2rem'
        }}>
          <h3 style={{ color: '#065f46', margin: '0 0 0.5rem 0' }}>
            Next Steps
          </h3>
          <p style={{ color: '#065f46', margin: 0, fontSize: '0.875rem' }}>
            The test routes are being deployed. Try accessing:<br/>
            <strong>/test</strong> or <strong>/dashboard-preview</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
