# Manual OAuth Flow Automation
Write-Host "🔐 Manual OAuth Flow - Get Real Shopify Data" -ForegroundColor Blue

Write-Host "`n📋 Step 1: Create Shopify Private App" -ForegroundColor Yellow
Write-Host "1. Go to: https://idealfit-2.myshopify.com/admin" -ForegroundColor White
Write-Host "2. Navigate to: Settings → Apps and sales channels" -ForegroundColor White
Write-Host "3. Click: 'Develop apps' → 'Create an app'" -ForegroundColor White
Write-Host "4. App Name: 'IdealFit API'" -ForegroundColor White
Write-Host "5. App URL: http://localhost:3001" -ForegroundColor White
Write-Host "6. Allowed redirection URL(s): http://localhost:3001/auth/callback" -ForegroundColor White

Write-Host "`n📋 Step 2: Configure API Access" -ForegroundColor Yellow
Write-Host "1. Go to 'Configuration' tab" -ForegroundColor White
Write-Host "2. Enable scopes: read_products, read_orders, read_customers, write_customers" -ForegroundColor White
Write-Host "3. Save configuration" -ForegroundColor White

Write-Host "`n📋 Step 3: Get Admin API Access Token" -ForegroundColor Yellow
Write-Host "1. Go to 'API credentials' tab" -ForegroundColor White
Write-Host "2. Click 'Install app'" -ForegroundColor White
Write-Host "3. Copy the Admin API access token" -ForegroundColor White

# Open Shopify Admin
Write-Host "`n🌐 Opening Shopify Admin..." -ForegroundColor Yellow
Start-Process "https://idealfit-2.myshopify.com/admin"

# Wait for user input
$accessToken = Read-Host "`nEnter the Admin API access token from your Shopify app"

if ($accessToken) {
    Write-Host "`n🔧 Step 4: Setting environment variable..." -ForegroundColor Yellow
    $env:SHOPIFY_ACCESS_TOKEN = $accessToken
    Write-Host "✅ Environment variable set: SHOPIFY_ACCESS_TOKEN=$accessToken" -ForegroundColor Green
    
    Write-Host "`n🔄 Step 5: Restarting server..." -ForegroundColor Yellow
    Write-Host "⚠️  Please restart the server manually with: node server.js" -ForegroundColor Red
    
    Write-Host "`n🧪 Step 6: Testing real data..." -ForegroundColor Yellow
    Write-Host "After restarting, test with:" -ForegroundColor White
    Write-Host "curl 'http://localhost:3001/api/shopify-rest-customers?limit=5'" -ForegroundColor Cyan
    Write-Host "curl 'http://localhost:3001/api/shopify-rest-analytics?period=30d'" -ForegroundColor Cyan
    
    Write-Host "`n🎯 Step 7: Open dashboard" -ForegroundColor Yellow
    Write-Host "Dashboard: http://localhost:8080/merchant-master-dashboard-enhanced.html" -ForegroundColor Cyan
    
} else {
    Write-Host "❌ No access token provided" -ForegroundColor Red
}

Write-Host "`n📝 Alternative: Use Existing App" -ForegroundColor Yellow
Write-Host "If you already have a Shopify app:" -ForegroundColor White
Write-Host "1. Go to Shopify Partners Dashboard" -ForegroundColor White
Write-Host "2. Find your app" -ForegroundColor White
Write-Host "3. Copy the Admin API access token" -ForegroundColor White

Write-Host "`n🏁 Manual OAuth flow completed!" -ForegroundColor Blue
