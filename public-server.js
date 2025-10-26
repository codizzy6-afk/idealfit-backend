const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route for merchant dashboard
app.get('/merchant-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'merchant-dashboard-fixed.html'));
});

// Route for admin credentials
app.get('/admin-credentials', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-credentials.html'));
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`✅ Standalone merchant dashboard server running on port ${PORT}`);
  console.log(`📝 Login: http://localhost:${PORT}/login`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/merchant-dashboard`);
  console.log(`🔐 Admin: http://localhost:${PORT}/admin-credentials`);
});
