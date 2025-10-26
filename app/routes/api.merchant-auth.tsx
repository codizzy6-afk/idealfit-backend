import type { ActionFunctionArgs } from "react-router";
import prisma from "../db.server";

// Merchant authentication endpoint
// POST /api/merchant-auth
export const action = async ({ request }: ActionFunctionArgs) => {
  // Dynamic import for bcrypt (CommonJS module)
  const bcrypt = await import("bcryptjs");
  try {
    const formData = await request.formData();
    const action = formData.get("action"); // "login" or "register"

    if (action === "register") {
      // Register new merchant
      const shopDomain = formData.get("shopDomain") as string;
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;
      const email = formData.get("email") as string;

      // Validate input
      if (!shopDomain || !username || !password) {
        return new Response(
          JSON.stringify({ success: false, error: "Shop domain, username, and password are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Check if merchant already exists
      const existingMerchant = await prisma.merchant.findUnique({
        where: { username },
      });

      if (existingMerchant) {
        return new Response(
          JSON.stringify({ success: false, error: "Username already exists" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create merchant
      const merchant = await prisma.merchant.create({
        data: {
          shopDomain,
          username,
          passwordHash,
          email,
        },
      });

      // Return success (don't return password hash)
      return new Response(
        JSON.stringify({
          success: true,
          message: "Merchant registered successfully",
          merchant: {
            id: merchant.id,
            shopDomain: merchant.shopDomain,
            username: merchant.username,
            email: merchant.email,
          },
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    } else if (action === "login") {
      // Login existing merchant
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;

      // Validate input
      if (!username || !password) {
        return new Response(
          JSON.stringify({ success: false, error: "Username and password are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Find merchant
      const merchant = await prisma.merchant.findUnique({
        where: { username },
      });

      if (!merchant) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid credentials" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      // Verify password
      const isValid = await bcrypt.compare(password, merchant.passwordHash);

      if (!isValid) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid credentials" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      // Return success (don't return password hash)
      return new Response(
        JSON.stringify({
          success: true,
          message: "Login successful",
          merchant: {
            id: merchant.id,
            shopDomain: merchant.shopDomain,
            username: merchant.username,
            email: merchant.email,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid action" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Merchant auth error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
