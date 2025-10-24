# Shopify OAuth Automation Script
# This script automates the OAuth flow to get real Shopify customer data

Write-Host "🔐 Starting Shopify OAuth Flow..." -ForegroundColor Blue

# Step 1: Get Authorization URL
Write-Host "`n📋 Step 1: Getting authorization URL..." -ForegroundColor Yellow
try {
    $authResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/shopify" -Method GET
    if ($authResponse.success) {
        Write-Host "✅ Authorization URL generated successfully!" -ForegroundColor Green
        Write-Host "🔗 Authorization URL: $($authResponse.authUrl)" -ForegroundColor Cyan
        
        # Open the authorization URL
        Write-Host "`n🌐 Opening Shopify authorization page..." -ForegroundColor Yellow
        Start-Process $authResponse.authUrl
        
        Write-Host "`n📝 Instructions:" -ForegroundColor Yellow
        Write-Host "1. A browser window will open with Shopify authorization" -ForegroundColor White
        Write-Host "2. Log in to your Shopify store (idealfit-2.myshopify.com)" -ForegroundColor White
        Write-Host "3. Authorize the app permissions" -ForegroundColor White
        Write-Host "4. You'll be redirected to a callback page" -ForegroundColor White
        Write-Host "5. Copy the authorization code from the URL" -ForegroundColor White
        Write-Host "6. Paste it below when prompted" -ForegroundColor White
        
        # Wait for user input
        Write-Host "`n⏳ Waiting for you to complete authorization..." -ForegroundColor Yellow
        $authCode = Read-Host "Enter the authorization code from the callback URL"
        
        if ($authCode) {
            Write-Host "`n🔄 Step 2: Exchanging authorization code for access token..." -ForegroundColor Yellow
            
            # Step 2: Exchange code for token
            $exchangeBody = @{
                code = $authCode
                state = $authResponse.state
            } | ConvertTo-Json
            
            try {
                $tokenResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/exchange" -Method POST -Body $exchangeBody -ContentType "application/json"
                
                if ($tokenResponse.success) {
                    Write-Host "✅ Access token obtained successfully!" -ForegroundColor Green
                    Write-Host "🎫 Access Token: $($tokenResponse.accessToken)" -ForegroundColor Cyan
                    Write-Host "📋 Scope: $($tokenResponse.scope)" -ForegroundColor Cyan
                    
                    # Step 3: Set environment variable
                    Write-Host "`n🔧 Step 3: Setting environment variable..." -ForegroundColor Yellow
                    $env:SHOPIFY_ACCESS_TOKEN = $tokenResponse.accessToken
                    Write-Host "✅ Environment variable set: SHOPIFY_ACCESS_TOKEN=$($tokenResponse.accessToken)" -ForegroundColor Green
                    
                    # Step 4: Restart server
                    Write-Host "`n🔄 Step 4: Restarting server with new token..." -ForegroundColor Yellow
                    Write-Host "⚠️  Please restart the server manually with: node server.js" -ForegroundColor Red
                    Write-Host "   The server needs to be restarted to use the new access token." -ForegroundColor Red
                    
                    # Step 5: Test endpoints
                    Write-Host "`n🧪 Step 5: Testing endpoints..." -ForegroundColor Yellow
                    Write-Host "Testing customer endpoint..." -ForegroundColor White
                    try {
                        $customerTest = Invoke-RestMethod -Uri "http://localhost:3001/api/shopify-rest-customers?limit=5" -Method GET
                        if ($customerTest.success) {
                            if ($customerTest.fallback) {
                                Write-Host "⚠️  Customer endpoint using fallback data (server needs restart)" -ForegroundColor Yellow
                            } else {
                                Write-Host "🎉 Customer endpoint working with real Shopify data!" -ForegroundColor Green
                            }
                        }
                    } catch {
                        Write-Host "❌ Customer endpoint test failed: $($_.Exception.Message)" -ForegroundColor Red
                    }
                    
                    Write-Host "`n🎯 OAuth Flow Complete!" -ForegroundColor Green
                    Write-Host "📊 Next steps:" -ForegroundColor Yellow
                    Write-Host "1. Restart the server: node server.js" -ForegroundColor White
                    Write-Host "2. Test the dashboard: http://localhost:8080/merchant-master-dashboard-enhanced.html" -ForegroundColor White
                    Write-Host "3. Verify real customer data is loading" -ForegroundColor White
                    
                } else {
                    Write-Host "❌ Failed to exchange authorization code: $($tokenResponse.error)" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ Error exchanging code: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ No authorization code provided. OAuth flow cancelled." -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Failed to generate authorization URL: $($authResponse.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error getting authorization URL: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 OAuth automation script completed." -ForegroundColor Blue
