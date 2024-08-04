import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { Page } from "./page";
import { INTENTS } from "./intent";
import {
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import { auth } from "~/utils/firebase/auth";
import { sessionLogin } from "~/utils/firebase/auth.server";
import { HOME_ROUTE } from "~/utils/constants";
import { getUserData } from "~/app/middlewares/auth.server";
import { redirectUserToWorkspace } from "~/app/route_utils/redirect_to_workspace";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserData({ request });
  if (user) {
    return redirectUserToWorkspace({ user, request });
  }
  return null;
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
          { method: "post" }
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

export { Page as default };

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("Processing action...");
  const formData = await request.json();
  const intent = String(formData["intent"]);

  if (intent === INTENTS.continueWithGoogle) {
    const idToken = String(formData["idToken"]);
    return await sessionLogin({
      request,
      idToken,
      redirectTo: HOME_ROUTE,
    });
  } else if (intent === INTENTS.loginWithEmailAndPassword) {
    console.log(`intent == ${INTENTS.loginWithEmailAndPassword}`);
    const email = String(formData["email"]);
    const password = String(formData["password"]);
    let user: User;
    try {
      user = (await signInWithEmailAndPassword(auth, email, password)).user;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error("Error occurred during sign-in:", e);
      const errorCode = String(e.code);
      let errorMessage: string;
      if (errorCode.includes("network")) {
        errorMessage = "Network error. Please try again.";
      } else if (errorCode.includes("auth")) {
        errorMessage = "Incorrect email or password";
      } else {
        errorMessage = "Unknown error occurred";
      }
      return { ok: false, error: errorMessage };
    }
    console.log("ping 3");

    const idToken = await user.getIdToken();
    return await sessionLogin({
      request,
      idToken,
      redirectTo: HOME_ROUTE,
    });
  }

  return null;
};
