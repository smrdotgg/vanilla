import { NavLink, useNavigation } from "@remix-run/react";
import { GrInProgress } from "react-icons/gr";
import { LuBuilding, LuComputer, LuServer, LuUsers } from "react-icons/lu";

import type { IconType } from "react-icons/lib";
import { useEffect, useState } from "react";
import { ModeToggle } from "~/components/ui/mode-toggle";
import { Progress } from "~/components/ui/progress";
import { flushSync } from "react-dom";

type topDashRoutes = "users" | "workspaces" | "vps";

const topDashElements: {
  route: topDashRoutes;
  name: string;
  icon: IconType;
}[] = [
  {
    route: "users",
    name: "Users",
    icon: LuUsers,
  },
  {
    route: "workspaces",
    name: "Workspaces",
    icon: LuBuilding,
  },
  {
    route: "vps",
    name: "Compute",
    icon: LuServer,
  },
];

type bottomDashRoutes = "settings";

const bottomDashElements: {
  route: bottomDashRoutes;
  name: string;
  icon: IconType;
}[] = [];

export function AdminDashLayout({
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selected,
}: {
  children: React.ReactNode;
  selected?: topDashRoutes;
}) {
  const [loading, setLoading] = useState("");

  return (
    <div className="flex h-screen max-h-screen w-screen flex-col  overflow-hidden">
      <FakeLoading />
      <div className="flex max-h-full flex-1 overflow-hidden">
        <div className=" flex h-full max-h-full w-64 flex-col justify-between overflow-hidden bg-red-100 dark:bg-red-950 text-white">
          <div className="flex h-full flex-col overflow-y-auto justify-between">
            <div>
              {topDashElements.map((e, i) => (
                <NavLink
                  key={i}
                  prefetch="intent"
                  className={({ isActive, isPending }) => {
                    if (isPending && loading !== e.route) {
                      flushSync(() => setLoading(e.route));
                    } else if (!isPending && loading === e.route) {
                      flushSync(() => setLoading(""));
                    }

                    const baseClasses =
                      "flex min-h-8 rounded m-1 border border-gray-500";
                    let stateClasses = "";

                    if (isActive) {
                      stateClasses = " bg-primary text-primary-foreground";
                    } else if (isPending) {
                      stateClasses = "cursor-wait bg-text-600 text-gray-500";
                    } else {
                      stateClasses =
                        "bg-pink-950 text-white border border-white transition duration-100 ";
                    }

                    return `${baseClasses} ${stateClasses}`;
                  }}
                  to={e.route}
                >
                  {loading == e.route ? (
                    <div className="flex h-full w-full items-center px-3">
                      <GrInProgress className="h-8 min-w-4 spin-in-0" size={16} />
                      <div className="pl-2"></div>

                      <p>{e.name}</p>
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center px-3">
                      <e.icon className="h-8 min-w-4" size={16} />
                      <div className="pl-2"></div>
                      <p>{e.name}</p>
                    </div>
                  )}
                </NavLink>
              ))}
            </div>

            <div>
              {bottomDashElements.map((e, i) => (
                <NavLink
                  key={i}
                  prefetch="intent"
                  className={({ isActive, isPending }) => {
                    if (isPending && loading !== e.route) {
                      flushSync(() => setLoading(e.route));
                    } else if (!isPending && loading === e.route) {
                      flushSync(() => setLoading(""));
                    }

                    const baseClasses = "flex min-h-8";
                    let stateClasses = "";

                    if (isActive) {
                      stateClasses =
                        "text-3xl bg-primary text-primary-foreground";
                    } else if (isPending) {
                      stateClasses = "cursor-wait bg-gray-600 text-gray-500";
                    } else {
                      stateClasses =
                        "bg-gray-900 text-white transition duration-100 hover:bg-gray-900";
                    }

                    return `${baseClasses} ${stateClasses}`;
                  }}
                  to={e.route}
                >
                  {loading == e.route ? (
                    <div className="flex h-full w-full items-center px-3">
                      <GrInProgress className="h-8 min-w-4" size={16} />
                      <div className="pl-2"></div>

                      <p>{e.name}</p>
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center px-3">
                      <e.icon className="h-8 min-w-4" size={16} />
                      <div className="pl-2"></div>
                      <p>{e.name}</p>
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="pt-2"></div>
          <AccountTile />
          <ModeToggle />
        </div>
        {/* Main Content */}
        <div className="flex max-h-full flex-1 overflow-y-auto ">
          {children}
        </div>
      </div>
    </div>
  );
}

function AccountTile() {
  return <></>;
}

function FakeLoading() {
  const navigation = useNavigation();
  if (navigation.state === "loading") {
    return <ProgressBar />;
  } else {
    return <div className="h-[.2rem] fixed top-0"></div>;
  }
}

function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (progress === 75) return;
      const remaining = 100 - progress;
      const newStep = remaining / 20;
      let newVal = progress + newStep;
      if (newVal > 75) newVal = 75;
      setProgress(newVal);
    }, 100);
    return () => clearInterval(interval);
  }, [progress]);
  return (
    <Progress
      value={progress}
      className="rounded-none h-[.2rem] fixed top-0 bg-transparent"
    />
  );
}
