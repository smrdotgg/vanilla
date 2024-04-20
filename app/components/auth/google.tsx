import { Link } from "@remix-run/react";
import { env } from "~/api";

export function ContinueWithGoogleButton() {
  return <Link to={`${env.PUBLIC_URL}auth/sign-in-with-google`}>Google</Link>;
}
