import { readFileSync } from "fs";
import { join } from "path";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Try to read from public directory
    let filePath;
    let content: string;
    
    try {
      filePath = join(process.cwd(), "public", "company-admin-dashboard.html");
      content = readFileSync(filePath, "utf-8");
    } catch (e) {
      // If not in public, try root directory
      filePath = join(process.cwd(), "company-admin-dashboard.html");
      content = readFileSync(filePath, "utf-8");
    }
    
    // Return HTML directly as Response
    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error serving company admin dashboard:", error);
    return new Response(
      `<!DOCTYPE html><html><body><h1>Error: Company admin dashboard not found</h1><p>${error instanceof Error ? error.message : 'Unknown error'}</p></body></html>`, 
      { 
        status: 404,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      }
    );
  }
}

// No default export needed for resource routes that return Response

