# Simple Manual OAuth Flow
Write-Host "🔐 Manual OAuth Flow - Get Real Shopify Data" -ForegroundColor Blue

Write-Host "`n📋 Create Shopify Private App:" -ForegroundColor Yellow
Write-Host "1. Go to: https://idealfit-2.myshopify.com/admin" -ForegroundColor White
Write-Host "2. Settings → Apps and sales channels → Develop apps → Create an app" -ForegroundColor White
Write-Host "3. App Name: IdealFit API" -ForegroundColor White
Write-Host "4. Enable scopes: read_products, read_orders, read_customers, write_customers" -ForegroundColor White
Write-Host "5. Install app and copy Admin API access token" -ForegroundColor White

# Open Shopify Admin
Start-Process "https://idealfit-2.myshopify.com/admin"

# Get access token
$token = Read-Host "Enter Admin API access token"

if ($token) {
    $env:SHOPIFY_ACCESS_TOKEN = $token
    Write-Host "✅ Token set! Restart server: node server.js" -ForegroundColor Green
} else {
    Write-Host "❌ No token provided" -ForegroundColor Red
}

Write-Host "`n🏁 Done!" -ForegroundColor Blue
