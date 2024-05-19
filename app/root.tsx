import { Toaster } from "./components/ui/sonner";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
  useRouteError,
} from "@remix-run/react";
import "./tailwind.css";
import { themeSessionResolver } from "./sessions.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
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
import { ModeToggle } from "./components/ui/mode-toggle";
import { api } from "./server/trpc/server.server";
import { useEffect } from "react";
import { env } from "./api";
import { getCookieSession } from "./server/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
console.log("TRIGGERED");
  const url = new URL(request.url);
  if (url.pathname == "/") return redirect("home");
  const { getTheme } = await themeSessionResolver(request);
  const data = await getCookieSession(request);
  //
  // return data?.userId;
  return {
    theme: getTheme(),
    userId: data?.userId,
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

// export function ErrorBoundary() {
//   // const navigate = useNavigate();
//   // useEffect(() => {
//   //   navigate("/auth/sign-in");
//   // }, []);
//   return (
//     <div className="flex h-screen w-screen *:m-auto">
//       <p>Loading...</p>
//     </div>
//   );
// }

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
        {/* <Theme */}
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
