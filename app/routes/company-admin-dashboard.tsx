import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { LoaderFunctionArgs } from "react-router";

// Resource route - no default export means React Router won't try to render it as a component
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Simple path resolution - just use process.cwd()
    const publicPath = join(process.cwd(), "public", "company-admin-dashboard.html");
    const rootPath = join(process.cwd(), "company-admin-dashboard.html");
    
    let filePath: string | null = null;
    let content: string | null = null;

    // Try public folder first
    if (existsSync(publicPath)) {
      filePath = publicPath;
      content = readFileSync(publicPath, "utf-8");
      console.log(`✅ Found company-admin-dashboard.html at: ${publicPath} (${content.length} bytes)`);
    } 
    // Fallback to root
    else if (existsSync(rootPath)) {
      filePath = rootPath;
      content = readFileSync(rootPath, "utf-8");
      console.log(`✅ Found company-admin-dashboard.html at: ${rootPath} (${content.length} bytes)`);
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

    // File not found - return helpful error
    const errorMessage = `File not found. Checked:\n1. ${publicPath} (${existsSync(publicPath) ? 'EXISTS' : 'NOT FOUND'})\n2. ${rootPath} (${existsSync(rootPath) ? 'EXISTS' : 'NOT FOUND'})\n\nCWD: ${process.cwd()}`;
    console.error(`❌ ${errorMessage}`);
    
    return new Response(`<html><body><h1>404 - File Not Found</h1><pre>${errorMessage}</pre></body></html>`, {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("❌ Error in company-admin-dashboard loader:", error);
    const errorDetails = `Error: ${error.message}\n\nStack: ${error.stack || 'No stack trace'}\n\nCWD: ${process.cwd()}`;
    return new Response(`<html><body><h1>500 - Server Error</h1><pre>${errorDetails}</pre></body></html>`, {
      status: 500,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }
}

// No default export - this makes it a resource route
