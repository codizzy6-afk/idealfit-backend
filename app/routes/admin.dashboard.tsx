import { readFileSync } from "fs";
import { join } from "path";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log("📊 Admin dashboard loader called");
  
  try {
    // Try to read from public directory first (production)
    let filePath;
    try {
      filePath = join(process.cwd(), "public", "company-admin-dashboard.html");
      console.log("📁 Trying public path:", filePath);
      const content = readFileSync(filePath, "utf-8");
      console.log("✅ File read successfully, size:", content.length);
      
      return new Response(content, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      });
    } catch (e) {
      // If not in public, try root directory (development)
      console.log("⚠️ Public path failed, trying root:", e);
      filePath = join(process.cwd(), "company-admin-dashboard.html");
      const content = readFileSync(filePath, "utf-8");
      console.log("✅ File read from root, size:", content.length);
      
      return new Response(content, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      });
    }
  } catch (error) {
    console.error("❌ Error serving company admin dashboard:", error);
    return new Response(
      `<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Error loading dashboard</h1><pre>${error instanceof Error ? error.message : String(error)}</pre></body></html>`, 
      { 
        status: 404,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }
}


