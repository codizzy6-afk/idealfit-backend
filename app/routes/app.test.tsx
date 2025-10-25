import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Temporary bypass for testing - redirect directly to dashboard
  throw redirect("/app/dashboard");
};

export default function TestRoute() {
  return (
    <div>
      <h1>Test Route - Redirecting to Dashboard</h1>
    </div>
  );
}
