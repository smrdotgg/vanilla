import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useFetcher, Link, useActionData } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "~/auth/firebase/auth";
import { sessionLogin, validateSession } from "~/auth/firebase/auth.server";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HOME_ROUTE } from "~/auth/contants";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sessionData = await validateSession(request);
  if (sessionData !== undefined) redirect(HOME_ROUTE);
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


const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function Page() {
  const fetcher = useFetcher();
  const [errorState, setErrorState] = useState("");
  const actionResult = useActionData<typeof action>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const [loading, setLoading] = useState(false);

  const error = errorState.length
    ? errorState
    : Number(actionResult?.error.length)
      ? actionResult?.error
      : undefined;

  const signInCallback = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      await signOut(auth);
      const { user, providerId, operationType } =
        await signInWithEmailAndPassword(auth, email, password);
      const idToken = await user.getIdToken();
      fetcher.submit(
        { idToken: idToken, "google-login": false },
        { method: "post" },
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setLoading(false);
      const errorCode = String(e.code);
      if (errorCode.includes("network")) {
        setErrorState("Network error. Please try again.");
      } else if (errorCode.includes("auth")) {
        setErrorState("Incorrect email or password");
      } else {
        setErrorState("Unknown error occured");
      }
    }
  };

  return (
    <div className="flex h-screen *:m-auto">
      <div className="flex w-96 flex-col gap-3 align-bottom">
        <h1>Sign In Form</h1>

        <Form {...form}>
          <form
            onChange={() => console.log(form.getValues())}
            onSubmit={form.handleSubmit(signInCallback)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Your email.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Your account password.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Link to="/auth/sign-in">Sign up</Link>
            </div>
            <Button disabled={loading} type="submit">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-red-400">{error ?? <>&nbsp;</>}</p>
          </form>
        </Form>
        <ContinueWithGoogleButton />
      </div>
    </div>
  );
}


export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  try {
    return await sessionLogin({
      request,
      idToken: String(formData.get("idToken")),
      redirectTo: "/home",
    });
  } catch (error) {
    return { error: String(error) };
  }
};
