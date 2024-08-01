import { NavLink, useNavigation } from "@remix-run/react";
import { GrInProgress } from "react-icons/gr";
import {
  LuArrowUp01,
  LuBuilding,
  LuMailbox,
  LuPointer,
  LuServer,
  LuUsers,
} from "react-icons/lu";

import type { IconType } from "react-icons/lib";
import { useEffect, useState } from "react";
import { ModeToggle } from "~/components/ui/mode-toggle";
import { Progress } from "~/components/ui/progress";

type topDashRoutes = "users" | "workspaces" | "vps" | "mailboxes" | "pointers";

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
  {
    route: "pointers",
    name: "Pointers",
    icon: LuArrowUp01,
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
                    const baseClasses =
                      "flex min-h-8 rounded m-1 border  hover:bg-muted  parent_class";
                    let stateClasses = "";
                    if (isActive) {
                      stateClasses =
                        "bg-muted  hide_loading font-semibold border-secondary-foreground";
                    } else if (isPending) {
                      stateClasses = "border-muted bg-muted hide_real_element";
                    } else {
                      stateClasses =
                        "text-muted-foreground hover:text-foreground border-transparent hide_loading";
                    }

                    return `${baseClasses} ${stateClasses}`;
                  }}
                  to={e.route}
                >
                  <div className="loading flex h-full w-full items-center px-3">
                    <GrInProgress className="h-8 min-w-4 " size={16} />
                    <div className="pl-2"></div>

                    <p>{e.name}</p>
                  </div>
                  <div className="real_element flex h-full w-full items-center px-3 abc">
                    <e.icon className="h-8 min-w-4" size={16} />
                    <div className="pl-2"></div>
                    <p>{e.name}</p>
                  </div>
                </NavLink>
              ))}
            </div>

            <div>
              {bottomDashElements.map((e, i) => (
                <NavLink
                  key={i}
                  prefetch="intent"
                  className={({ isActive, isPending }) => {
                    const baseClasses = "flex min-h-8";
                    let stateClasses = "";

                    if (isActive) {
                      stateClasses =
                        "text-3xl bg-primary text-primary-foreground hide_loading";
                    } else if (isPending) {
                      stateClasses =
                        "cursor-wait bg-gray-600 text-gray-500 hide_real_element";
                    } else {
                      stateClasses =
                        "bg-gray-900 text-white transition duration-100 hover:bg-gray-900 hide_loading";
                    }

                    return `${baseClasses} ${stateClasses}`;
                  }}
                  to={e.route}
                >
                  <div className="flex h-full w-full items-center px-3 real_element">
                    <GrInProgress className="h-8 min-w-4" size={16} />
                    <div className="pl-2"></div>

                    <p>{e.name}</p>
                  </div>
                  <div className="flex h-full w-full items-center px-3 loading">
                    <e.icon className="h-8 min-w-4" size={16} />
                    <div className="pl-2"></div>
                    <p>{e.name}</p>
                  </div>
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
