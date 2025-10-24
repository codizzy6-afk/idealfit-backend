// Shopify OAuth Helper
// This file helps generate Shopify OAuth URLs and handle the authentication flow

import crypto from 'crypto';

// Shopify OAuth Configuration
const SHOPIFY_OAUTH_CONFIG = {
  shop: 'idealfit-2.myshopify.com',
  clientId: 'df65d05c59fdde03db6cad23f63bb6e7',
  clientSecret: process.env.SHOPIFY_CLIENT_SECRET || 'your-client-secret',
  scopes: 'read_products,read_orders,read_customers,write_customers',
  redirectUri: 'http://localhost:3001/auth/callback'
};

// Generate OAuth URL
function generateOAuthURL() {
  const state = crypto.randomBytes(16).toString('hex');
  const nonce = crypto.randomBytes(16).toString('hex');
  
  const params = new URLSearchParams({
    client_id: SHOPIFY_OAUTH_CONFIG.clientId,
    scope: SHOPIFY_OAUTH_CONFIG.scopes,
    redirect_uri: SHOPIFY_OAUTH_CONFIG.redirectUri,
    state: state,
    'grant_options[]': 'per-user'
  });
  
  // Use the correct Shopify OAuth URL format
  const oauthUrl = `https://${SHOPIFY_OAUTH_CONFIG.shop}/admin/oauth/authorize?${params}`;
  
  return {
    url: oauthUrl,
    state: state,
    nonce: nonce
  };
}

// Exchange authorization code for access token
async function exchangeCodeForToken(code, state) {
  const tokenUrl = `https://${SHOPIFY_OAUTH_CONFIG.shop}/admin/oauth/access_token`;
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: SHOPIFY_OAUTH_CONFIG.clientId,
      client_secret: SHOPIFY_OAUTH_CONFIG.clientSecret,
      code: code
    })
  });
  
  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

// Verify webhook HMAC
function verifyWebhook(data, hmac) {
  const calculatedHmac = crypto
    .createHmac('sha256', SHOPIFY_OAUTH_CONFIG.clientSecret)
    .update(data, 'utf8')
    .digest('base64');
  
  return calculatedHmac === hmac;
}

export { generateOAuthURL, exchangeCodeForToken, verifyWebhook, SHOPIFY_OAUTH_CONFIG };
