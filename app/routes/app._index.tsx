import { useEffect } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect as AppBridgeRedirect } from "@shopify/app-bridge/actions";

import { authenticate, registerWebhooks } from "../shopify.server";

type LoaderData = {
  requiresRedirect: boolean;
  redirectUrl?: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);
    try {
      await registerWebhooks({ session });
    } catch (e) {
      console.warn(
        "Webhook registration skipped/failed:",
        e instanceof Error ? e.message : e
      );
    }

    throw redirect("/app/merchant-dashboard");
  } catch (error) {
    if (error instanceof Response && error.status === 302) {
      const redirectLocation = error.headers.get("Location");

      if (redirectLocation && redirectLocation.startsWith("/auth")) {
        const origin =
          process.env.SHOPIFY_APP_URL || new URL(request.url).origin;
        const absoluteUrl = new URL(redirectLocation, origin).toString();

        const headers = new Headers(error.headers);
        headers.set("Content-Type", "application/json");

        return new Response(
          JSON.stringify({
            requiresRedirect: true,
            redirectUrl: absoluteUrl,
          }),
          {
            status: 200,
            headers,
          }
        );
      }

      throw error;
    }

    throw error;
  }
};

export default function AppIndex() {
  const data = useLoaderData<LoaderData>();
  const appBridge = useAppBridge();

  useEffect(() => {
    if (!data?.requiresRedirect || !data.redirectUrl) {
      return;
    }

    if (appBridge) {
      const redirect = AppBridgeRedirect.create(appBridge);
      redirect.dispatch(
        AppBridgeRedirect.Action.REMOTE,
        data.redirectUrl
      );
    } else {
      window.location.href = data.redirectUrl;
    }
  }, [data, appBridge]);

  return null;
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
