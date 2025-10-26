import { readFileSync } from "fs";
import { join } from "path";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const filePath = join(process.cwd(), "public", "login.html");
    const content = readFileSync(filePath, "utf-8");
    
    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error serving login.html:", error);
    return new Response("Login page not found", { status: 404 });
  }
}
