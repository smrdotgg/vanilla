import {
  redirect,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { Link, useActionData, useFetcher, useSubmit } from "@remix-run/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { signOut, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "~/auth/firebase/auth";
import {
  getUserInfoFromIdToken,
  sessionLogin,
  validateSession,
} from "~/auth/firebase/auth.server";
import { HOME_ROUTE } from "~/auth/contants";
import { prisma } from "~/db/prisma";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sessionData = await validateSession(request);
  if (sessionData !== undefined) redirect(HOME_ROUTE);
  return null;
};

export default function Page() {
  const fetcher = useFetcher();
  const [errorState, setErrorState] = useState("");
  const actionResult = useActionData<typeof action>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const error = errorState.length ? errorState : actionResult?.error;

  const signUpWithEmailAndPassword = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      await signOut(auth);
      const { user, providerId, operationType } =
        await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await user.getIdToken();
      const refreshToken = user.refreshToken;
      fetcher.submit(
        { idToken, refreshToken, "google-login": false },
        { method: "post" },
      );
    } catch (e) {
      setErrorState(String(e));
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    signUpWithEmailAndPassword(values);
  }

  return (
    <div className="flex h-screen *:m-auto">
      <div className="flex w-96 flex-col gap-3 align-bottom">
        <h1>Sign Up Form</h1>
        <Form {...form}>
          <form
            onChange={() => console.log(form.getValues())}
            onSubmit={form.handleSubmit(onSubmit)}
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Confirm your account password
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Link to="/auth/sign-in">Sign in</Link>
            </div>
            <Button type="submit">Submit</Button>
            <p className="text-red-400">{error ?? <>&nbsp;</>}</p>
          </form>
        </Form>
      </div>
    </div>
  );
}

const formSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const idToken = String(formData.get("idToken"));
  try {
    const data = await getUserInfoFromIdToken(idToken);
    // data.
    await prisma.user.create({
      data: {
        oauth_provider: data.firebase.sign_in_provider,
        firebase_id: data.uid,
        email: data.email,
        email_verified: data.email_verified ?? false,
      },
    });

    return await sessionLogin({
      request,
      idToken,
      redirectTo: "/home",
    });
  } catch (error) {
    console.error("Error in action:", error);
    return { error: String(error) };
  }
};
