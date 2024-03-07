import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return null;
};

export default function Index() {
  return <h1>campaigns</h1>;
}
