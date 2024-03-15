import { cssBundleHref } from "@remix-run/css-bundle";
import { Provider } from "jotai";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import stylesheet from "~/tailwind.css";
import { themeSessionResolver } from "./sessions.server";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import clsx from "clsx";
import { DashLayout } from "./components/custom/side-bar";
import { Toaster } from "./components/ui/sonner";
import { TRPCReactProvider } from "./server/trpc/react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  return {
    theme: getTheme(),
    ENV: {
      STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    },
  };
}

export function App() {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  return (
    <html lang="en" className={`${clsx(theme)} font-sans`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body>
        <DashLayout selected="/home">
          <Outlet />
        </DashLayout>
        <ScrollRestoration />
        <Toaster />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();
  return (
  <Provider>
<TRPCReactProvider>
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <App />
    </ThemeProvider>
    </TRPCReactProvider>
  </Provider>

  );
}
