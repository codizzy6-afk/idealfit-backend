import type { ActionFunctionArgs } from "react-router";
import { json } from "react-router";
import * as bcrypt from "bcryptjs";
import prisma from "../db.server";

// Merchant authentication endpoint
// POST /api/merchant-auth
export const action = async ({ request }: ActionFunctionArgs) => {
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
        return json(
          { success: false, error: "Shop domain, username, and password are required" },
          { status: 400 }
        );
      }

      // Check if merchant already exists
      const existingMerchant = await prisma.merchant.findUnique({
        where: { username },
      });

      if (existingMerchant) {
        return json(
          { success: false, error: "Username already exists" },
          { status: 400 }
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
      return json({
        success: true,
        message: "Merchant registered successfully",
        merchant: {
          id: merchant.id,
          shopDomain: merchant.shopDomain,
          username: merchant.username,
          email: merchant.email,
        },
      });
    } else if (action === "login") {
      // Login existing merchant
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;

      // Validate input
      if (!username || !password) {
        return json(
          { success: false, error: "Username and password are required" },
          { status: 400 }
        );
      }

      // Find merchant
      const merchant = await prisma.merchant.findUnique({
        where: { username },
      });

      if (!merchant) {
        return json(
          { success: false, error: "Invalid credentials" },
          { status: 401 }
        );
      }

      // Verify password
      const isValid = await bcrypt.compare(password, merchant.passwordHash);

      if (!isValid) {
        return json(
          { success: false, error: "Invalid credentials" },
          { status: 401 }
        );
      }

      // Return success (don't return password hash)
      return json({
        success: true,
        message: "Login successful",
        merchant: {
          id: merchant.id,
          shopDomain: merchant.shopDomain,
          username: merchant.username,
          email: merchant.email,
        },
      });
    } else {
      return json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Merchant auth error:", error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};
