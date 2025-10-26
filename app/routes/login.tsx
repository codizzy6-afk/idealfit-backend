import { readFileSync } from "fs";
import { join } from "path";

export async function loader() {
  const filePath = join(process.cwd(), "public", "login.html");
  
  try {
    const content = readFileSync(filePath, "utf-8");
    return new Response(content, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    return new Response("Login page not found", { status: 404 });
  }
}
