import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createMerchant() {
  try {
    // Get arguments from command line
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.log("Usage: node create-merchant.js <shopDomain> <username> <password> [email]");
      console.log("\nExample:");
      console.log('  node create-merchant.js "idealfit-2.myshopify.com" "merchant1" "password123" "merchant@example.com"');
      process.exit(1);
    }

    const shopDomain = args[0];
    const username = args[1];
    const password = args[2];
    const email = args[3] || null;

    // Check if merchant already exists
    const existing = await prisma.merchant.findUnique({
      where: { username },
    });

    if (existing) {
      console.error(`❌ Merchant with username "${username}" already exists`);
      process.exit(1);
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

    console.log("\n✅ Merchant created successfully!");
    console.log("\nCredentials:");
    console.log(`  Shop Domain: ${merchant.shopDomain}`);
    console.log(`  Username: ${merchant.username}`);
    console.log(`  Password: ${password} (hidden)`);
    console.log(`  Email: ${merchant.email || "Not provided"}`);
    console.log(`  ID: ${merchant.id}`);
    console.log("\n📧 Send these credentials to the merchant to access their dashboard.");

  } catch (error) {
    console.error("\n❌ Error creating merchant:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createMerchant();
