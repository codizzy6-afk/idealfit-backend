import type { LoaderFunctionArgs } from "react-router";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export async function loader({ params, request }: LoaderFunctionArgs) {
  // Always serve company-admin-dashboard.html
  const publicPath = join(process.cwd(), "public", "company-admin-dashboard.html");
  const rootPath = join(process.cwd(), "company-admin-dashboard.html");
  
  try {
    let content: string | null = null;
    let source: string | null = null;
    
    if (existsSync(publicPath)) {
      content = readFileSync(publicPath, "utf-8");
      source = publicPath;
      console.log(`✅ Serving company-admin-dashboard.html from: ${publicPath} (${content.length} bytes)`);
    } else if (existsSync(rootPath)) {
      content = readFileSync(rootPath, "utf-8");
      source = rootPath;
      console.log(`✅ Serving company-admin-dashboard.html from: ${rootPath} (${content.length} bytes)`);
    } else {
      const cwd = process.cwd();
      const errorMsg = `❌ company-admin-dashboard.html not found.\n\nChecked paths:\n1. ${publicPath} (${existsSync(publicPath) ? 'EXISTS' : 'NOT FOUND'})\n2. ${rootPath} (${existsSync(rootPath) ? 'EXISTS' : 'NOT FOUND'})\n\nCWD: ${cwd}`;
      console.error(errorMsg);
      return new Response(`<html><body><h1>404 - File Not Found</h1><pre>${errorMsg}</pre></body></html>`, { 
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }
    
    if (!content || content.length === 0) {
      const errorMsg = `File found at ${source} but content is empty. File exists: ${existsSync(source || '')}`;
      console.error(errorMsg);
      return new Response(`<html><body><h1>500 - Empty File</h1><pre>${errorMsg}</pre></body></html>`, { 
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }
    
    return new Response(content, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    const errorMsg = `Error serving company-admin-dashboard.html: ${error.message}\n\nStack: ${error.stack || 'No stack'}\n\nCWD: ${process.cwd()}`;
    console.error(errorMsg);
    return new Response(`<html><body><h1>500 - Server Error</h1><pre>${errorMsg}</pre></body></html>`, { 
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
}
