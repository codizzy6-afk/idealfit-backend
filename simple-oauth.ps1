# Simple Shopify OAuth Script
Write-Host "🔐 Starting Shopify OAuth Flow..." -ForegroundColor Blue

# Get Authorization URL
Write-Host "`n📋 Getting authorization URL..." -ForegroundColor Yellow
$authResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/shopify" -Method GET

if ($authResponse.success) {
    Write-Host "✅ Authorization URL generated!" -ForegroundColor Green
    Write-Host "🔗 URL: $($authResponse.authUrl)" -ForegroundColor Cyan
    
    # Open browser
    Start-Process $authResponse.authUrl
    
    Write-Host "`n📝 Complete these steps:" -ForegroundColor Yellow
    Write-Host "1. Log in to Shopify store" -ForegroundColor White
    Write-Host "2. Authorize the app" -ForegroundColor White
    Write-Host "3. Copy the authorization code from callback URL" -ForegroundColor White
    
    # Get authorization code
    $authCode = Read-Host "Enter authorization code"
    
    if ($authCode) {
        Write-Host "`n🔄 Exchanging code for token..." -ForegroundColor Yellow
        
        $exchangeBody = @{
            code = $authCode
            state = $authResponse.state
        } | ConvertTo-Json
        
        $tokenResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/exchange" -Method POST -Body $exchangeBody -ContentType "application/json"
        
        if ($tokenResponse.success) {
            Write-Host "✅ Access token obtained!" -ForegroundColor Green
            Write-Host "🎫 Token: $($tokenResponse.accessToken)" -ForegroundColor Cyan
            
            # Set environment variable
            $env:SHOPIFY_ACCESS_TOKEN = $tokenResponse.accessToken
            Write-Host "✅ Environment variable set" -ForegroundColor Green
            
            Write-Host "`n🔄 Restart server with: node server.js" -ForegroundColor Yellow
            Write-Host "🧪 Test dashboard: http://localhost:8080/merchant-master-dashboard-enhanced.html" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n🏁 OAuth flow completed!" -ForegroundColor Blue
