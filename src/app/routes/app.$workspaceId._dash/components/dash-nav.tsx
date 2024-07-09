import {
  Link,
  NavLink,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { GrInProgress } from "react-icons/gr";
import { LuMailbox, LuSettings } from "react-icons/lu";

import { loader } from "../route";
import type { IconType } from "react-icons/lib";
import { TbWorld } from "react-icons/tb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { ModeToggle } from "~/components/ui/mode-toggle";
import { Button } from "~/components/ui/button";
import { INTENTS } from "../types";
import { flushSync } from "react-dom";
import { Progress } from "~/components/ui/progress";

type topDashRoutes = "domains" | "mailboxes";

const topDashElements: { route: topDashRoutes; name: string; icon: IconType }[] = [
  {
    route: "domains",
    name: "Domains",
    icon: TbWorld,
  },
  {
    route: "mailboxes",
    name: "Mailboxes",
    icon: LuMailbox,
  },
];

type bottomDashRoutes = "settings";

const bottomDashElements: { route: bottomDashRoutes; name: string; icon: IconType }[] = [
  {
    route: "settings",
    name: "Settings",
    icon: LuSettings,
  },
];



export function DashLayout({
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
        {/* Side Bar */}
        <div className=" flex h-full max-h-full w-64 flex-col justify-between overflow-hidden bg-gray-900 text-white">
          <div className="py-2 px-2 flex *:m-auto">
            <WorkspaceSelect />
          </div>
          {/* <div className="h-[1px] my-2 bg-gray-100 w-full"></div> */}
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

                    const baseClasses = "flex min-h-8 rounded m-1";
                    let stateClasses = "";

                    if (isActive) {
                      stateClasses =
                        " bg-muted-foreground text-primary-foreground";
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
                        " bg-muted-foreground text-primary-foreground";
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
function AccountTile(){
return <></>;
  return <>account tile</>
}

function WorkspaceSelect() {
  const { user, workspaceMembership } = useLoaderData<typeof loader>();
  const [, setShowModal] = useState(false);

  const myWorkspaces = user.workspace_user_join_list.map((join) => ({
    name: join.workspace.name,
    id: join.workspace.id,
  }));

  const { submit, state } = useFetcher();

  const onChange = (newVal: string) => {
    const formData = new FormData();
    formData.append("intent", INTENTS.changeSelectedWorksapce);
    formData.append("targetWorkspaceId", newVal);
    submit(formData, { method: "post" });
  };

  return (
    <div className="flex flex-col w-full p-1">
      <p className="text-xs">Selected Workspace</p>
      <div className="pt-[.2rem]"></div>
      <Select
        disabled={state !== "idle"}
        onValueChange={onChange}
        name="targetWorkspaceId"
        value={workspaceMembership?.workspace_id.toString()}
      >
        <SelectTrigger className="w-full border border-gray-600">
          <SelectValue placeholder="Select Workspace" />
        </SelectTrigger>
        <SelectContent>
          {myWorkspaces.map((w) => (
            <SelectItem key={w.id} value={String(w.id)}>
              {w.name}
            </SelectItem>
          ))}
          <Button
            asChild
            onClick={() => setShowModal(true)}
            className="flex w-full "
            variant={"ghost"}
          >
            <Link to={"/create_workspace"}>+ Create new Workspace</Link>
          </Button>
        </SelectContent>
      </Select>
    </div>
  );
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
