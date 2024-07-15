import { useFetcher, Link } from "@remix-run/react";
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
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "~/utils/firebase/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { action } from "./route";
import { INTENTS } from "./intent";

export function Page() {
  const fetcher = useFetcher<typeof action>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const signInCallback = async (formData: {
    email: string;
    password: string;
  }) => {
    fetcher.submit(
      { ...formData, intent: INTENTS.loginWithEmailAndPassword },
      { method: "post", encType: "application/json" }
    );
  };

  const loading = fetcher.state !== "idle";

  const error = fetcher.data?.error;

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
                    <Input type="password" {...field} />
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

function ContinueWithGoogleButton() {
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
          { idToken: idToken, intent: INTENTS.continueWithGoogle },
          { method: "post", encType: "application/json" }
        );
      })
      .catch((err) => {
        console.error("Error during Google sign-in:", err);
      });
  };

  return (
    <button className="ui button" type="button" onClick={signInWithGoogle}>
      <i className="icon google"></i>
      Login with Google
    </button>
  );
}

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
