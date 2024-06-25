import { Outlet } from "@remix-run/react"

export const loader = () => {
  console.log("app.$workspaceId func ran");
  return null;
}
export default function Page(){
  return <Outlet />
}
