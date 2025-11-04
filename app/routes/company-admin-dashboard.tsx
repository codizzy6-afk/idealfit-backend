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
      console.log(`Checking path: ${path}`);
      if (existsSync(path)) {
        filePath = path;
        try {
          content = readFileSync(path, "utf-8");
          console.log(`✅ Found company-admin-dashboard.html at: ${path} (${content.length} bytes)`);
          break;
        } catch (readError) {
          console.error(`Error reading file at ${path}:`, readError);
        }
      } else {
        console.log(`❌ File not found at: ${path}`);
      }
    }

    if (content) {
      return new Response(content, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    }

    // If file not found, return helpful error message
    const errorMessage = `Company admin dashboard file not found.\n\nChecked paths:\n${possiblePaths.map((p, i) => `${i + 1}. ${p} (${existsSync(p) ? 'EXISTS' : 'NOT FOUND'})`).join('\n')}\n\nCurrent working directory: ${process.cwd()}\n__dirname: ${__dirname}`;
    console.error(errorMessage);
    
    return new Response(`<html><body><h1>404 - File Not Found</h1><pre>${errorMessage}</pre></body></html>`, {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("Error serving company-admin-dashboard.html:", error);
    const errorDetails = `Error: ${error.message}\n\nStack: ${error.stack}\n\nCWD: ${process.cwd()}\n__dirname: ${__dirname}`;
    return new Response(`<html><body><h1>500 - Server Error</h1><pre>${errorDetails}</pre></body></html>`, {
      status: 500,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }
}

// Return null component to prevent React Router from rendering anything
export default function CompanyAdminDashboard() {
  return null;
}
