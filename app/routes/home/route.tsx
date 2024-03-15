// eslint-disable-next-line react/no-children-prop
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { sendEmail } from "./send.server";
export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return null;
};

export const action = async () => {
  await sendEmail(
    "ya29.a0Ad52N3_z1r-EQeaNIAOXJ_5Lq3MfhOIQVjO-yMg98PdYcWb69Xr3Qb6WxDDA8B74CwoWHTqjvID-YRFwRsw_Isscu25Yt4apQcpgPo09nTh-nZVeJQljh2uLciUKiG12ND9rRzW-Mua-NAF39yQ2QcT-SOOU3J6BRPqPaCgYKAd0SARISFQHGX2MiXeKkZtJqvpCXE42LcDnwuw0171",
  );
  return null;
};

export default function Index() {
  return <div>Home</div>;

  // http://localhost:3000/sender_accounts
  return (
    <div className="flex h-full flex-grow flex-col  *:m-auto">
      <Form method="post">
        <Button type="submit">submit</Button>
      </Form>
      <Button asChild>
        <Link
          to={`https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=271133683810-5o7hj207b74ck9l5sj490ervlvrp0q85.apps.googleusercontent.com&redirect_uri=http://localhost:3000/sender_accounts&scope=https://www.googleapis.com/auth/gmail.send&access_type=offline&prompt=consent`}
        >
          Google Auth
        </Link>
      </Button>
    </div>
  );
}
