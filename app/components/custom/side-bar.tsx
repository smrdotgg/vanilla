import { Link, NavLink } from "@remix-run/react";
import { GrInProgress } from "react-icons/gr";
import { FaHome } from "react-icons/fa";

import { HiClipboardDocument } from "react-icons/hi2";
import { IoIosPeople } from "react-icons/io";
import { IoPersonSharp, IoSettingsSharp } from "react-icons/io5";
import { IconType } from "react-icons/lib";
import { ModeToggle } from "../ui/mode-toggle";
import { ReactNode, useState } from "react";
import { Theme, useTheme } from "remix-themes";

type dashRoute =
  | "/home"
  | "/settings"
  | "/contacts"
  | "/campaigns"
  | "/sender_accounts";

const elements: { route: dashRoute; name: string; icon: IconType }[] = [
  {
    route: "/home",
    name: "Home",
    icon: FaHome,
  },
  {
    route: "/settings",
    name: "Settings",
    icon: IoSettingsSharp,
  },
  {
    route: "/contacts",
    name: "Contacts",
    icon: IoPersonSharp,
  },
  {
    route: "/campaigns",
    name: "Campaign",
    icon: HiClipboardDocument,
  },
  {
    route: "/sender_accounts",
    name: "Sender Accounts",
    icon: IoIosPeople,
  },
];

export function DashLayout({
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selected,
}: {
  children: React.ReactNode;
  selected?: dashRoute;
}) {
  // const [loading, setLoading] = useState("");
  // eslint-disable-next-line prefer-const
  let loading = "";
  const setLoading = (x: string) => {};

  const [theme] = useTheme();
  return (
    <div className="max-w-screen min-w-screen flex max-h-screen min-h-screen ">
      {loading === "" ? (
        <></>
      ) : theme === Theme.DARK ? (
        <img
          src="/loading-dark.svg"
          className="absolute left-1/2 top-10 h-10 -translate-x-1/2"
          alt="loading spinner"
        />
      ) : (
        <img
          src="/loading.svg"
          className="absolute left-1/2 top-10 h-10 -translate-x-1/2"
          alt="loading spinner"
        />
      )}
      <div
        className={`flex flex-col w-52 min-w-52  justify-between  bg-primary p-2 text-white dark:bg-secondary `}
      >
        <div className="flex flex-col gap-1">
          <Link to="/">
            <img
              className="mr-auto"
              alt="Splitbox Logo"
              src={"/download.svg"}
              width={8 * 3}
              height={8 * 3}
            />
          </Link>

          <div className="pt-10"></div>
          <>
            {elements.map((e, i) => (
              <NavLink
                key={i}
                className={({ isActive, isPending }) => {
                  if (isPending && loading != e.route) setLoading(e.route);
                  if (isActive && loading == e.route) setLoading("");
                  return `
                  flex min-h-8 rounded 
                ${
                  isActive
                    ? "bg-blue-200 text-blue-900"
                    : isPending
                      ? "cursor-wait bg-white text-black dark:bg-gray-50 dark:text-gray-400"
                      : "bg-blue-900    text-white "
                }`;
                }}
                to={e.route}
              >
                {loading == e.route ? (
                  <GrInProgress className="m-auto " size={8 * 2} />
                ) : (
                  <div className="flex  h-full w-full px-3 *:my-auto">
                    <e.icon className="h-8  min-w-4" size={8 * 2} />
                    <div className="pl-2"></div>
                    <p>{e.name}</p>
                  </div>
                )}
              </NavLink>
            ))}
          </>
        </div>
        <ModeToggle />
      </div>

      <div className="flex-grow">{children}</div>
    </div>
  );
}
// <div className="h-14 px-2 w-full  flex justify-end bg-primary dark:bg-secondary *:my-auto">
//   <ThemeToggle />
// </div>
