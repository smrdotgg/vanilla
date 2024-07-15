import { Link } from "@remix-run/react";
import { WorkspaceSettings } from "./components/workspace_settings";

export function Page() {
  return (
    <div className="flex  max-w-[900px] mx-auto w-full">
      <SettingsNav />
      <WorkspaceSettings />
    </div>
  );
}

const SettingsNav = () => {
  return (
    <div className="flex flex-col w-80  p-10 ">
      <h1>Settings</h1>
      <div className="pt-10"></div>
      <nav className="grid gap-4 text-sm text-muted-foreground">
        <Link to="#" className="font-semibold text-primary">
          General
        </Link>
        {/* <Link to="#">Security</Link> */}
        {/* <Link to="#">Integrations</Link> */}
        {/* <Link to="#">Support</Link> */}
        {/* <Link to="#">Organizations</Link> */}
        {/* <Link to="#">Advanced</Link> */}
      </nav>
    </div>
  );
};
