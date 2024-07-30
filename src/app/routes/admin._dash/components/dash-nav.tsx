import { NavLink, useNavigation } from "@remix-run/react";
import { GrInProgress } from "react-icons/gr";
import { LuBuilding, LuMailbox, LuServer, LuUsers } from "react-icons/lu";

import type { IconType } from "react-icons/lib";
import { useEffect, useState } from "react";
import { ModeToggle } from "~/components/ui/mode-toggle";
import { Progress } from "~/components/ui/progress";

type topDashRoutes = "users" | "workspaces" | "vps" | "mailboxes";

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
  {
    route: "mailboxes",
    name: "Mailboxes",
    icon: LuMailbox,
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
    <div className="flex h-screen max-w-[100%] max-h-screen w-screen flex-col  overflow-hidden">
      <FakeLoading />
      <div className="flex w-screen max-w-[100%] max-h-full flex-1 overflow-hidden">
        <div className=" flex h-full max-h-full w-64 flex-col justify-between overflow-hidden  font-mono  ">
          <p className="text-center py-2 select-none font-mono text-3xl uppercase">
            splitbox admin
          </p>
          <div className="flex h-full flex-col overflow-y-auto justify-between">
            <div>
              {topDashElements.map((e, i) => (
                <NavLink
                  key={i}
                  prefetch="intent"
                  className={({ isActive, isPending }) => {
                    if (isPending && loading !== e.route) {
                      setLoading(e.route);
                    } else if (!isPending && loading === e.route) {
                      setLoading("");
                    }

                    let baseClasses =
                      "flex min-h-8 rounded m-1 border border-gray-300 dark:border-gray-800 text-black";
                    let stateClasses = "";

                    if (isActive) {
                      stateClasses =
                        "bg-muted text-primary border-gray-800 dark:border-gray-500";
                    } else if (isPending) {
                      stateClasses =
                        "bg-muted cursor-wait bg-text-600 text-muted dark:bg-muted-foreground ";
                    } else {
                      stateClasses =
                        "bg-card   text-muted-foreground dark:text-muted dark:bg-muted-foreground";
                    }
                    stateClasses = "";
                    baseClasses =
                      "flex min-h-8 rounded m-1 border-transparent  ";
                    if (isActive) {
                      stateClasses = "bg-muted border-none";
                    } else if (isPending) {
                      stateClasses = "border-muted ";
                    } else {
                      stateClasses =
                        "text-muted-foreground hover:text-foreground border-none";
                    }

                    return `${baseClasses} ${stateClasses}`;
                  }}
                  to={e.route}
                >
                  {loading == e.route ? (
                    <div className="flex h-full w-full items-center px-3">
                      <GrInProgress className="h-8 min-w-4 " size={16} />
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
                      setLoading(e.route);
                    } else if (!isPending && loading === e.route) {
                      setLoading("");
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
          <ModeToggle className="dark:text-white" />
        </div>
        <div className="bg-muted-foreground mx-2 w-[1px] h-full"></div>
        {/* Main Content */}
        <div className="flex max-h-full w-full flex-grow overflow-y-auto ">
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
