import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { LoaderFunctionArgs } from "react-router";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Try multiple possible paths
    const possiblePaths = [
      join(process.cwd(), "public", "company-admin-dashboard.html"),
      join(process.cwd(), "company-admin-dashboard.html"),
      join(__dirname, "..", "..", "public", "company-admin-dashboard.html"),
      join(__dirname, "..", "..", "company-admin-dashboard.html"),
    ];

    let filePath: string | null = null;
    let content: string | null = null;

    for (const path of possiblePaths) {
      if (existsSync(path)) {
        filePath = path;
        try {
          content = readFileSync(path, "utf-8");
          console.log(`✅ Found company-admin-dashboard.html at: ${path}`);
          break;
        } catch (readError) {
          console.error(`Error reading file at ${path}:`, readError);
        }
      }
    }

    if (content) {
      return new Response(content, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    }

    // If file not found, return helpful error message
    const errorMessage = `Company admin dashboard file not found. Checked paths:\n${possiblePaths.join('\n')}\n\nCurrent working directory: ${process.cwd()}\n__dirname: ${__dirname}`;
    console.error(errorMessage);
    
    return new Response(`<html><body><h1>404 - File Not Found</h1><pre>${errorMessage}</pre></body></html>`, {
      status: 404,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error: any) {
    console.error("Error serving company-admin-dashboard.html:", error);
    return new Response(`<html><body><h1>500 - Server Error</h1><pre>${error.message}\n${error.stack}</pre></body></html>`, {
      status: 500,
      headers: {
        "Content-Type": "text/html",
      },
    });
  }
}

export default function CompanyAdminDashboard() {
  return null;
}
