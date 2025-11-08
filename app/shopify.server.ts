import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { sendMerchantWelcomeEmail } from "./utils/email.server";

// Debug environment variables
console.log("Environment variables:");
console.log("SHOPIFY_API_KEY:", process.env.SHOPIFY_API_KEY ? "SET" : "NOT SET");
console.log("SHOPIFY_API_SECRET:", process.env.SHOPIFY_API_SECRET ? "SET" : "NOT SET");
console.log("SHOPIFY_APP_URL:", process.env.SHOPIFY_APP_URL);
console.log("SCOPES:", process.env.SCOPES);

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
  hooks: {
    afterAuth: async ({ session }) => {
      const shopDomain = session.shop;
      if (!shopDomain) {
        return;
      }

      try {
        const existing = await prisma.merchant.findUnique({
          where: { shopDomain },
        });

        const shopEmail = session.user?.email || null;

        if (!existing) {
          const username = shopDomain.replace(/\.myshopify\.com$/i, "");
          const rawPassword = crypto
            .randomBytes(9)
            .toString("base64")
            .replace(/[^a-zA-Z0-9]/g, "")
            .slice(0, 12);
          const passwordHash = await bcrypt.hash(rawPassword, 10);

          await prisma.merchant.create({
            data: {
              shopDomain,
              username,
              passwordHash,
              email: shopEmail,
            },
          });

          if (shopEmail) {
            const dashboardUrl =
              process.env.MERCHANT_PORTAL_URL ||
              `${process.env.SHOPIFY_APP_URL ?? ""}/merchant-login`;

            const delivered = await sendMerchantWelcomeEmail({
              to: shopEmail,
              shopDomain,
              username,
              password: rawPassword,
              dashboardUrl,
            });

            if (!delivered) {
              console.warn(
                `Merchant ${shopDomain} created but welcome email could not be delivered.`
              );
            }
          } else {
            console.warn(
              `Merchant ${shopDomain} created without an email on file. No welcome email sent.`
            );
          }
        } else if (shopEmail && existing.email !== shopEmail) {
          await prisma.merchant.update({
            where: { shopDomain },
            data: { email: shopEmail },
          });
        }
      } catch (error) {
        console.error("Error provisioning merchant after auth:", error);
      }
    },
  },
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
