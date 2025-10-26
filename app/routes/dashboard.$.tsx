import type { LoaderFunctionArgs } from "react-router";
import { readFileSync } from "fs";
import { join } from "path";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const filename = params["*"] || "dashboard.html";
  const filePath = join(process.cwd(), "public", filename);
  
  try {
    const content = readFileSync(filePath, "utf-8");
    return new Response(content, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    return new Response("File not found", { status: 404 });
  }
}
