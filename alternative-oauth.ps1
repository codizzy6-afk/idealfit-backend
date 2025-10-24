# Alternative OAuth Flow - Direct Store Access
# This bypasses the Shopify Partners app requirement

Write-Host "🔐 Alternative OAuth Flow - Direct Store Access" -ForegroundColor Blue

# Step 1: Manual OAuth URL Generation
Write-Host "`n📋 Step 1: Generate OAuth URL manually" -ForegroundColor Yellow

$shop = "idealfit-2.myshopify.com"
$clientId = "df65d05c59fdde03db6cad23f63bb6e7"
$scopes = "read_products,read_orders,read_customers,write_customers"
$redirectUri = "http://localhost:3001/auth/callback"
$state = [System.Guid]::NewGuid().ToString("N")

$authUrl = "https://$shop/admin/oauth/authorize?client_id=$clientId&scope=$scopes&redirect_uri=$redirectUri&state=$state"

Write-Host "✅ Generated OAuth URL:" -ForegroundColor Green
Write-Host "🔗 $authUrl" -ForegroundColor Cyan

# Step 2: Open browser
Write-Host "`n🌐 Opening OAuth URL in browser..." -ForegroundColor Yellow
Start-Process $authUrl

Write-Host "`n📝 Instructions:" -ForegroundColor Yellow
Write-Host "1. Complete authorization in the browser" -ForegroundColor White
Write-Host "2. Log in to your Shopify store" -ForegroundColor White
Write-Host "3. Authorize the app permissions" -ForegroundColor White
Write-Host "4. Copy the authorization code from the callback URL" -ForegroundColor White

# Step 3: Wait for authorization code
$authCode = Read-Host "`nEnter the authorization code from the callback URL"

if ($authCode) {
    Write-Host "`n🔄 Step 2: Exchanging code for access token..." -ForegroundColor Yellow
    
    # Step 4: Exchange code for token
    $exchangeBody = @{
        client_id = $clientId
        client_secret = "your-client-secret"  # This needs to be set
        code = $authCode
    } | ConvertTo-Json
    
    try {
        $tokenResponse = Invoke-RestMethod -Uri "https://$shop/admin/oauth/access_token" -Method POST -Body $exchangeBody -ContentType "application/json"
        
        if ($tokenResponse.access_token) {
            Write-Host "✅ Access token obtained!" -ForegroundColor Green
            Write-Host "🎫 Token: $($tokenResponse.access_token)" -ForegroundColor Cyan
            
            # Set environment variable
            $env:SHOPIFY_ACCESS_TOKEN = $tokenResponse.access_token
            Write-Host "✅ Environment variable set" -ForegroundColor Green
            
            Write-Host "`n🔄 Restart server with: node server.js" -ForegroundColor Yellow
            Write-Host "🧪 Test dashboard: http://localhost:8080/merchant-master-dashboard-enhanced.html" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Token exchange failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 This is expected - you need to set the client secret" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ No authorization code provided" -ForegroundColor Red
}

Write-Host "`n📝 Alternative: Use Shopify CLI" -ForegroundColor Yellow
Write-Host "1. Install Shopify CLI: npm install -g @shopify/cli" -ForegroundColor White
Write-Host "2. Login: shopify auth login" -ForegroundColor White
Write-Host "3. Get token: shopify auth token" -ForegroundColor White

Write-Host "`n🏁 Alternative OAuth flow completed!" -ForegroundColor Blue
