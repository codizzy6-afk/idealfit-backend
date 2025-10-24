# Simulate OAuth Flow with Test Token
# This simulates the OAuth exchange process

Write-Host "🔐 Simulating Shopify OAuth Flow..." -ForegroundColor Blue

# Simulate getting an authorization code
$testAuthCode = "test_auth_code_12345"
Write-Host "📋 Simulated authorization code: $testAuthCode" -ForegroundColor Yellow

# Simulate exchanging code for token
Write-Host "🔄 Simulating token exchange..." -ForegroundColor Yellow

# Create a test access token (in real scenario, this would come from Shopify)
$testAccessToken = "shpat_test_" + (Get-Random -Minimum 1000000000000000 -Maximum 9999999999999999)
Write-Host "🎫 Generated test access token: $testAccessToken" -ForegroundColor Cyan

# Set environment variable
$env:SHOPIFY_ACCESS_TOKEN = $testAccessToken
Write-Host "✅ Environment variable set: SHOPIFY_ACCESS_TOKEN=$testAccessToken" -ForegroundColor Green

# Test the endpoint
Write-Host "`n🧪 Testing endpoint with test token..." -ForegroundColor Yellow
try {
    $testResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/shopify-rest-customers?limit=5" -Method GET
    if ($testResponse.success) {
        if ($testResponse.fallback) {
            Write-Host "⚠️  Endpoint using fallback data (expected with test token)" -ForegroundColor Yellow
        } else {
            Write-Host "🎉 Endpoint working with real data!" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Complete real OAuth flow in browser" -ForegroundColor White
Write-Host "2. Get actual access token from Shopify" -ForegroundColor White
Write-Host "3. Set real token: `$env:SHOPIFY_ACCESS_TOKEN = 'real_token'" -ForegroundColor White
Write-Host "4. Restart server: node server.js" -ForegroundColor White
Write-Host "5. Test dashboard for real data" -ForegroundColor White

Write-Host "`n🌐 OAuth URL opened in browser - complete the flow there" -ForegroundColor Green
Write-Host "🔗 After authorization, you'll get a real access token" -ForegroundColor Green

Write-Host "`n🏁 OAuth simulation completed!" -ForegroundColor Blue
