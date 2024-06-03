import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import admin from "firebase-admin";
import { useFetcher } from "@remix-run/react";
import { Page } from "./page";
import {
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "~/auth/firebase/auth";
import {
  authCookie,
  sessionLogin,
  validateSession,
} from "~/auth/firebase/auth.server";
import { HOME_ROUTE } from "~/auth/contants";
import { getFirestore } from "firebase/firestore";

export const doLoader = async ({ request }: LoaderFunctionArgs) => {
  const sessionData = await validateSession(request);
  if (sessionData !== undefined) return redirect(HOME_ROUTE);
  const session = await authCookie.getSession(request.headers.get("cookie"));
  // check if the user is already logged in
  const { uid } = await admin
    .auth()
    .verifySessionCookie(session.get("session") || "")
    .catch(() => ({ uid: undefined }));

  // redirect authorized users
  if (uid) {
    return redirect(`/ABC?${uid}`);
  }
  return json(
    {},
    {
      headers: {
        "Set-Cookie": await authCookie.commitSession(session),
      },
    },
  );
};



export const doAction = async ({ request }: ActionFunctionArgs) => {
  // first we validate the form
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  console.log("ping 1");
  const formError = json({ error: "Please fill all fields!" }, { status: 400 });
  if (typeof email !== "string") return formError;
  if (typeof password !== "string") return formError;
  // sign in the user with the client sdk
  const { user, error }: { user?: User; error?: string } =
    await signInWithEmailAndPassword(auth, email, password)
      .then(({ user }) => ({ user }))
      .catch((error) => ({ error: String(error.code) }));
  console.log("ping 2");
  // return appropriate response, if sign in fails
  if (!user || error) return json({ error }, { status: 401 });
  console.log("ping 3");
  // this is still a client sdk method
  const idToken = await user.getIdToken();
  const expiresIn = 1000 * 60 * 60 * 24 * 7; // 1 week
  // this is a firebase-admin method
  const sessionCookie = await admin.auth().createSessionCookie(idToken, {
    expiresIn,
  });
  console.log("ping 4");
  // send the generated session cookie to the client with remix utilities
  const session = await authCookie.getSession(request.headers.get("cookie"));
  session.set("session", sessionCookie);
  return redirect(HOME_ROUTE, {
    headers: {
      "Set-Cookie": await authCookie.commitSession(session),
    },
  });
};
