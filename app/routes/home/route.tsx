// eslint-disable-next-line react/no-children-prop
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
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
  return (

  <div>Home</div>

  );

}
