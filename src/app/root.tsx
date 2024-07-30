import { Toaster } from "~/components/ui/sonner";
import {
  Meta,
  Links,
  Outlet,
  Scripts,
  useLoaderData,
  ScrollRestoration,
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
import {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { env } from "~/utils/env";
import { BACKUP_THEME } from "./client_random/constants";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const { getTheme } = await themeSessionResolver(request);
  return {
    theme: getTheme() ?? Theme.DARK,
    url: url.pathname,
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
    <Providers theme={data?.theme ?? BACKUP_THEME}>
      <LayoutCore>{children}</LayoutCore>
    </Providers>
  );
}

function LayoutCore({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  const backupTheme =
    env.PUBLIC_ENV === "development" ? Theme.LIGHT : Theme.LIGHT;

  return (
    <html lang="en" className={`${clsx(theme ?? backupTheme)} font-sans`}>
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

export function Providers({
  children,
  theme,
}: {
  theme: Theme | null;
  children: React.ReactNode;
}) {
  return (
    <>
      {/*<Provider>*/}
      {/*  <TRPCReactProvider>*/}
      <ThemeProvider themeAction="/action/set-theme" specifiedTheme={theme}>
        {children}
      </ThemeProvider>
      {/*   </TRPCReactProvider> */}
      {/* </Provider> */}
    </>
  );
}

export default function App() {
  return <Outlet />;
}

//
// import {
//   Links,
//   Meta,
//   Outlet,
//   Scripts,
//   ScrollRestoration,
// } from "@remix-run/react";
// import "./tailwind.css";
//
// export function Layout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <head>
//         <meta charSet="utf-8" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <Meta />
//         <Links />
//       </head>
//       <body>
//         {children}
//         <ScrollRestoration />
//         <Scripts />
//       </body>
//     </html>
//   );
// }
//
// export default function App() {
//   return <Outlet />;
// }
