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
  redirect,
} from "@remix-run/node";
import { getUserData } from "./middlewares/auth.server";
import { redirectUserToWorkspace } from "./route_utils/redirect_to_workspace";
import { env } from "~/utils/env";
import { prisma } from "~/utils/db";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  console.log(`url pathname = ${url.pathname}`);
  if (url.pathname === "/") {
    const { firebaseData, user } = await getUserData({ request });
    if (user) {
      return redirectUserToWorkspace({ request, user });
    } else {
      if (env.NODE_ENV === "development" && firebaseData) {
        const user = await prisma.user.create({
          data: {
            firebase_id: firebaseData.uid,
            email_verified: firebaseData.email_verified ?? false,
            oauth_provider: firebaseData.firebase.sign_in_provider,
          },

          include: {
            workspace_user_join_list: { include: { workspace: true } },
          },
        });
        return redirectUserToWorkspace({ request, user });
      }
      return redirect("/auth/sign-in");
    }
  }

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
  const backupTheme =
    env.PUBLIC_ENV === "development" ? Theme.DARK : Theme.LIGHT;

  return (
    <Providers theme={data?.theme ?? backupTheme}>
      <LayoutCore>{children}</LayoutCore>
    </Providers>
  );
}

function LayoutCore({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  const backupTheme =
    env.PUBLIC_ENV === "development" ? Theme.DARK : Theme.LIGHT;

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

function Providers({
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
