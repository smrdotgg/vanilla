import { NavLink } from "@remix-run/react";
import { GrInProgress } from "react-icons/gr";
import { FaHome } from "react-icons/fa";

import { HiClipboardDocument } from "react-icons/hi2";
import { IoPersonSharp, IoSettingsSharp } from "react-icons/io5";
import { IconType } from "react-icons/lib";
import { ModeToggle } from "../ui/toggle";
import { ReactNode, useState } from "react";
import { Theme, useTheme } from "remix-themes";

type dashRoute = "/home" | "/settings" | "/contacts" | "/campaigns";

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
];

export function DashLayout({
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selected,
}: {
  children: React.ReactNode;
  selected?: dashRoute;
}) {
  const [loading, setLoading] = useState("");
  const [theme] = useTheme();
  return (
    <div className="max-w-screen min-w-screen flex max-h-screen min-h-screen ">
      {loading === "" ? (
        <></>
      ) : theme === Theme.DARK ? (
        <img
          src="/loading-dark.svg"
          className="absolute left-1/2 top-10 -translate-x-1/2 h-10"
          alt="loading spinner"
        />
      ) : (
        <img
          src="/loading.svg"
          className="absolute left-1/2 top-10 -translate-x-1/2 h-10"
          alt="loading spinner"
        />
      )}
      <div className="flex flex-col   p-2  text-white bg-primary dark:bg-blue-950 justify-between">
        <div className="flex flex-col gap-1">
          <img
            className="mx-auto"
            alt="Splitbox Logo"
            src={"/download.svg"}
            width={8 * 3}
            height={8 * 3}
          />

          <div className="pt-10"></div>
          <>
            {elements.map((e, i) => (
              <NavLink
                key={i}
                className={({ isActive, isPending }) => {
                  if (isPending && loading != e.route) setLoading(e.route);
                  if (isActive && loading == e.route) setLoading("");
                  return `
                  rounded py-2   h-8 w-8 flex 
                ${
                  isActive
                    ? "bg-blue-100 text-blue-900"
                    : isPending
                      ? "bg-white dark:bg-gray-300 dark:text-gray-500 text-black border border-black cursor-wait"
                      : "text-white dark:border dark:border-blue-200 dark:bg-blue-900 bg-black "
                }`;
                }}
                to={e.route}
              >
                {loading == e.route ? (
                  <GrInProgress className="m-auto " size={8 * 2} />
                ) : (
                  <e.icon className="m-auto " size={8 * 2} />
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
