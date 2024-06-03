import { useFetcher, Link, useActionData, useLoaderData } from "@remix-run/react";
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loader,action } from "./route";

export function Page() {
const data = useLoaderData<typeof loader>();
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
    console.log("Attempting sign in...");
    setLoading(true);
    try {
      await signOut(auth);
      console.log("User signed out successfully.");
      const { user, providerId, operationType } =
        await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in successfully:", user);
      const idToken = await user.getIdToken();
      console.log("Retrieved ID token:", idToken);
      fetcher.submit(
        { idToken: idToken, "google-login": false },
        { method: "post" },
      );
      console.log("Submission successful.");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error("Error occurred during sign-in:", e);
      setLoading(false);
      const errorCode = String(e.code);
      if (errorCode.includes("network")) {
        setErrorState("Network error. Please try again.");
      } else if (errorCode.includes("auth")) {
        setErrorState("Incorrect email or password");
      } else {
        setErrorState("Unknown error occurred");
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
              <Link to="/auth/sign-up">Sign up</Link>
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

