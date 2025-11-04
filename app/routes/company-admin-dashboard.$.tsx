import type { LoaderFunctionArgs } from "react-router";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export async function loader({ params, request }: LoaderFunctionArgs) {
  // Always serve company-admin-dashboard.html
  const publicPath = join(process.cwd(), "public", "company-admin-dashboard.html");
  const rootPath = join(process.cwd(), "company-admin-dashboard.html");
  
  try {
    let content: string | null = null;
    
    if (existsSync(publicPath)) {
      content = readFileSync(publicPath, "utf-8");
      console.log(`✅ Serving company-admin-dashboard.html from: ${publicPath}`);
    } else if (existsSync(rootPath)) {
      content = readFileSync(rootPath, "utf-8");
      console.log(`✅ Serving company-admin-dashboard.html from: ${rootPath}`);
    } else {
      console.error(`❌ company-admin-dashboard.html not found at ${publicPath} or ${rootPath}`);
      return new Response("Company admin dashboard not found", { status: 404 });
    }
    
    return new Response(content, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error serving company-admin-dashboard.html:", error);
    return new Response("Error loading company admin dashboard", { status: 500 });
  }
}
