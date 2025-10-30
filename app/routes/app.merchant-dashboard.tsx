import { readFileSync } from "fs";
import { join } from "path";
import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { redirect } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  // Authenticate with Shopify OAuth
  await authenticate.admin(request);
  const { session } = await authenticate.admin(request);
  
  // Try to read from public directory first (production)
  try {
    let filePath;
    try {
      filePath = join(process.cwd(), "public", "merchant-dashboard-fixed.html");
      const content = readFileSync(filePath, "utf-8");
      
      // Inject shop domain into the HTML so it knows which store it's viewing
      const modifiedContent = content.replace(
        /idealfit-2\.myshopify\.com/g,
        session?.shop || "idealfit-2.myshopify.com"
      );
      
      return new Response(modifiedContent, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      });
    } catch (e) {
      // If not in public, try root directory (development)
      filePath = join(process.cwd(), "merchant-dashboard-fixed.html");
      const content = readFileSync(filePath, "utf-8");
      
      // Inject shop domain
      const modifiedContent = content.replace(
        /idealfit-2\.myshopify\.com/g,
        session?.shop || "idealfit-2.myshopify.com"
      );
      
      return new Response(modifiedContent, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      });
    }
  } catch (error) {
    console.error("Error serving merchant dashboard:", error);
    return new Response("Merchant dashboard not found", { status: 404 });
  }
}

export default function MerchantDashboard() {
  return null;
}
