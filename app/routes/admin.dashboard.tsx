import { readFileSync } from "fs";
import { join } from "path";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Try to read from public directory
    let filePath;
    try {
      filePath = join(process.cwd(), "public", "company-admin-dashboard.html");
      const content = readFileSync(filePath, "utf-8");
      
      return new Response(content, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      });
    } catch (e) {
      // If not in public, try root directory
      filePath = join(process.cwd(), "company-admin-dashboard.html");
      const content = readFileSync(filePath, "utf-8");
      
      return new Response(content, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      });
    }
  } catch (error) {
    console.error("Error serving company admin dashboard:", error);
    return new Response("Company admin dashboard not found", { status: 404 });
  }
}

export default function AdminDashboard() {
  return null;
}

