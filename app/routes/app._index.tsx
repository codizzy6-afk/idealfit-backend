import { useEffect } from "react";
import type {
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { redirect } from "react-router";
import { authenticate, registerWebhooks } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  // Ensure webhooks are registered for this shop/session
  try {
    await registerWebhooks({ session });
  } catch (e) {
    console.warn("Webhook registration skipped/failed:", e instanceof Error ? e.message : e);
  }
  // Redirect to dashboard
  throw redirect("/app/dashboard");
};

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
