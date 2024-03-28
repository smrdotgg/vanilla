import { Toaster } from "./components/ui/sonner";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import "./tailwind.css";
import { themeSessionResolver } from "./sessions.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import {
  PreventFlashOnWrongTheme,
  Theme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import { DashLayout } from "./components/custom/side-bar";
import { Provider } from "jotai";
import { TRPCReactProvider } from "./server/trpc/react";
import clsx from "clsx";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  const x = getTheme();
  return {
    theme: getTheme(),
    ENV: {
      STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    },
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  return (
    <Providers theme={data?.theme ?? Theme.DARK}>
      <LayoutCore>{children}</LayoutCore>
    </Providers>
  );
}

function LayoutCore({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  return (
    <html lang="en" className={`${clsx(theme)} font-sans`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data?.theme ?? "dark")} />
        <Links />
      </head>
      <body>
        <DashLayout selected="/home">{children}</DashLayout>
        <ScrollRestoration />
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}

function Providers({
  children,
  theme,
}: {
  theme: Theme | null;
  children: React.ReactNode;
}) {
  return (
    <Provider>
      <TRPCReactProvider>
        <ThemeProvider specifiedTheme={theme} themeAction="/action/set-theme">
          {children}
        </ThemeProvider>
      </TRPCReactProvider>
    </Provider>
  );
}

export default function App() {
  return <Outlet />;
}
