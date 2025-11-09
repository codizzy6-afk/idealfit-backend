import { useEffect } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect as AppBridgeRedirect } from "@shopify/app-bridge/actions";

import { authenticate, registerWebhooks } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shopParameter = url.searchParams.get("shop");

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
          process.env.SHOPIFY_APP_URL || url.origin;
        const absoluteUrl = new URL(redirectLocation, origin).toString();

        return { requiresRedirect: true, redirectUrl: absoluteUrl };
      }

      throw error;
    }

    if (!shopParameter) {
      const origin = process.env.SHOPIFY_APP_URL || url.origin;
      const absoluteUrl = new URL("/auth/login", origin);
      if (!absoluteUrl.searchParams.has("shop") && shopParameter) {
        absoluteUrl.searchParams.set("shop", shopParameter);
      }
      return { requiresRedirect: true, redirectUrl: absoluteUrl.toString() };
    }

    throw error;
  }
};

export default function AppIndex() {
  const data = useLoaderData<{ requiresRedirect: boolean; redirectUrl?: string }>();
  const appBridge = useAppBridge();

  useEffect(() => {
    if (!data?.requiresRedirect || !data.redirectUrl) {
      return;
    }

    if (appBridge) {
      const redirect = AppBridgeRedirect.create(appBridge);
      redirect.dispatch(AppBridgeRedirect.Action.REMOTE, {
        url: data.redirectUrl,
        newContext: true,
      });
    } else {
      window.location.href = data.redirectUrl;
    }
  }, [data, appBridge]);

  return null;
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

