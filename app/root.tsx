import { Toaster } from "./components/ui/sonner";
import {
  Meta,
  Links,
  Outlet,
  Scripts,
  useLoaderData,
  ScrollRestoration,
  redirect,
} from "@remix-run/react";
import "./tailwind.css";
import { themeSessionResolver } from "./sessions.server";
import {
  Theme,
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";

import clsx from "clsx";
import { Provider } from "jotai";
import { TRPCReactProvider } from "./server/trpc/react";
import {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  if (url.pathname == "/") {
    return redirect("/home");
  }
  const { getTheme } = await themeSessionResolver(request);
  return {
    theme: getTheme(),
  };
};
export const meta: MetaFunction = () => {
  return [
    { title: "Splitbox" },
    {
      property: "og:title",
      content: "Very cool app",
    },
    {
      name: "description",
      content: "This app is the best",
    },
  ];
};
export const links: LinksFunction = () => {
  return [
    { rel: "icon", type: "image/svg+xml", href: "/icon_logo.svg" },
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "/icon_logo_dark.svg",
      media: "(prefers-color-scheme: dark)",
    },
  ];
};
export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();

  return (
    <Providers theme={data?.theme ?? Theme.LIGHT}>
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
      <body className="overflow-hidden">
        {children}
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
        <ThemeProvider themeAction="/action/set-theme" specifiedTheme={theme}>
          {children}
        </ThemeProvider>
      </TRPCReactProvider>
    </Provider>
  );
}

export default function App() {
  return <Outlet />;
}
