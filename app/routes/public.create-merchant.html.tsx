import { readFileSync } from "fs";
import { join } from "path";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const filePath = join(process.cwd(), "public", "create-merchant.html");
    const content = readFileSync(filePath, "utf-8");
    
    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error serving create-merchant.html:", error);
    return new Response("Create merchant page not found", { status: 404 });
  }
}
