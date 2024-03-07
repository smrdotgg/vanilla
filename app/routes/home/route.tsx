// eslint-disable-next-line react/no-children-prop
import type { MetaFunction } from "@remix-run/node";
import { useNavigation } from "@remix-run/react";
export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};


export default function Index() {
  const nav = useNavigation();

  return (
    <div className="flex">
      <h1>Simple Form Example</h1>
    </div>
  );
}
