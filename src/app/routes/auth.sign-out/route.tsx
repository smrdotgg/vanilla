import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { sessionLogout } from "~/utils/firebase/auth.server";

export const loader = ({request}: LoaderFunctionArgs) => sessionLogout(request);
