import {
  Form,
  Link,
  NavLink,
  useFetcher,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { RxBorderSplit } from "react-icons/rx";
import { GrInProgress } from "react-icons/gr";
import { LuMailbox } from "react-icons/lu";
import { FaHome } from "react-icons/fa";

import { HiClipboardDocument } from "react-icons/hi2";
import { loader } from "../route";
import { IoIosPeople } from "react-icons/io";
import { IoPersonSharp, IoSettingsSharp } from "react-icons/io5";
import type { IconType } from "react-icons/lib";
import downloadsvg from "../assets/download.svg";
import { TbWorld } from "react-icons/tb";
import { useTheme } from "remix-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { ModeToggle } from "~/components/ui/mode-toggle";
import { filterNulls } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { INTENTS } from "../types";
import { flushSync } from "react-dom";

type dashRoute =
  // | "/home"
  // | "/settings"
  // | "/contacts"
  // | "/campaigns"
  // | "/sender_accounts"
  | "/domains"
  // | "/splitboxes"
  | "/mailboxes";

const elements: { route: dashRoute; name: string; icon: IconType }[] = [
  // {
  //   route: "/home",
  //   name: "Home",
  //   icon: FaHome,
  // },
  // {
  //   route: "/settings",
  //   name: "Settings",
  //   icon: IoSettingsSharp,
  // },
  // {
  //   route: "/contacts",
  //   name: "Contacts",
  //   icon: IoPersonSharp,
  // },
  // {
  //   route: "/campaigns",
  //   name: "Campaigns",
  //   icon: HiClipboardDocument,
  // },
  // {
  //   route: "/sender_accounts",
  //   name: "Sender Accounts",
  //   icon: IoIosPeople,
  // },
  {
    route: "/domains",
    name: "Domains",
    icon: TbWorld,
  },
  // {
  //   route: "/splitboxes",
  //   name: "Splitboxes",
  //   icon: RxBorderSplit,
  // },
  {
    route: "/mailboxes",
    name: "Mailboxes",
    icon: LuMailbox,
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

  const x = useNavigation();

  const { selected_workspace_id } = useLoaderData<typeof loader>();
  return (
    <div className="flex h-screen max-h-screen w-screen flex-col  overflow-hidden">
      {/* Top Bar */}
      {/* <div className="flex h-16 max-h-16 min-h-16 w-full items-center bg-gray-900 px-4 text-white"> */}
      {/*   <Link to="/"> */}
      {/*     <img */}
      {/*       className="mr-auto" */}
      {/*       alt="Splitbox Logo" */}
      {/*       src={downloadsvg} */}
      {/*       width={24} */}
      {/*       height={24} */}
      {/*     /> */}
      {/*   </Link> */}
      {/*   <SlashDivide /> */}
      {/*   <WorkspaceSelect /> */}
      {/* </div> */}
      <div className="flex max-h-full flex-1 overflow-hidden">
        {/* Side Bar */}
        <div className=" flex h-full max-h-full w-64 flex-col justify-between overflow-hidden bg-gray-900 text-white">
        <div className="py-2 px-2 flex *:m-auto">
        {/* <div className="w-full h-10 bg-red-400"></div> */}
          <WorkspaceSelect />
        </div>
          <div className="flex h-full flex-col overflow-y-auto">
            {elements.map((e, i) => (
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
                    stateClasses =
                      "cursor-wait bg-gray-600 text-gray-500";
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

function SlashDivide() {
  return <p className="mx-3 text-6xl text-gray-400">/</p>;
}

function WorkspaceSelect() {
  const { user, selectedWorkspace } = useLoaderData<typeof loader>();
  const [showModal, setShowModal] = useState(false);

  const myWorkspaces = user.workspace_user_join_list.map((join) => ({
    name: join.workspace.name,
    id: join.workspace.id,
  }));

  const { submit, state } = useFetcher();

  const onChange = (newVal: string) => {
    const formData = new FormData();
    formData.append("intent", INTENTS.changeSelectedWorksapce);
    formData.append("targetWorkspaceId", newVal);
    submit(formData, { action: "/set_selected_workspace", method: "post" });
  };

  return (
    <Select
      disabled={state !== "idle"}
      onValueChange={onChange}
      name="targetWorkspaceId"
      value={selectedWorkspace?.id.toString()}
    >
      <SelectTrigger className="w-full border-none">
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
  );
}
