import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useFetcher, } from "@remix-run/react";
import {Page} from "./page";
import {
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "~/auth/firebase/auth";
import { sessionLogin, validateSession } from "~/auth/firebase/auth.server";
import { HOME_ROUTE } from "~/auth/contants";
import { prisma } from "~/db/prisma";

export const loader = async ({ request }: LoaderFunctionArgs) => {
const users = await prisma.user.findMany();
  const sessionData = await validateSession(request);
  if (sessionData !== undefined) return redirect(HOME_ROUTE);
  return users;
};

export function ContinueWithGoogleButton() {
  const fetcher = useFetcher();

  const signInWithGoogle = async () => {
    console.log("Signing out before Google sign-in...");
    await signOut(auth);
    console.log("Sign-out successful. Initiating Google sign-in...");
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (res) => {
        console.log("Google sign-in successful. Getting ID token...");
        const idToken = await res.user.getIdToken();
        console.log("ID token retrieved. Submitting to fetcher...");
        fetcher.submit(
          { idToken: idToken, "google-login": true },
          { method: "post" },
        );
      })
      .catch((err) => {
        console.error("Error during Google sign-in:", err);
      });
  };

  return (
    <button
      className="ui button"
      type="button"
      onClick={() => signInWithGoogle()}
    >
      <i className="icon google"></i>
      Login with Google
    </button>
  );
}

export {Page as default}



export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("Processing action...");
  const formData = await request.formData();

  try {
    console.log("Attempting session login...");
    return await sessionLogin({
      request,
      idToken: String(formData.get("idToken")),
      redirectTo: "/home",
    });
  } catch (error) {
    console.error("Error occurred during session login:", error);
    return { error: String(error) };
  }
};
