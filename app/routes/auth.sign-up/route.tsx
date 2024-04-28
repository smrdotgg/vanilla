import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { Scrypt, generateId } from "lucia";
import { z } from "zod";
import { lucia } from "~/auth/lucia.server";
import { ContinueWithGoogleButton } from "~/components/auth/google";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { db } from "~/db/index.server";
import { TB_users } from "~/db/schema.server";

export default function Page() {
  const actionResult = useActionData<typeof action>();
  return (
    <div className="flex h-screen *:m-auto">
      <div className="flex w-96 flex-col gap-3 align-bottom">
        <h1>Sign Up Form</h1>
        <Form method="post" className="flex flex-col gap-3 align-bottom">
          <Input
            name="email"
            type="email"
            placeholder="email"
          />
          <Input
            name="password"
            type="password"
            placeholder="password"
          />
          <Button type="submit">Submit</Button>
        </Form>
        <Link to="/auth/sign-in">Sign in</Link>
        <ContinueWithGoogleButton />
        <p className="text-red-400">{actionResult?.error ?? ""}</p>
      </div>
    </div>
  );
}

const authZod = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function action(args: ActionFunctionArgs) {
  const formData = await args.request.formData();
  const formEmail = String(formData.get("email"));
  const formPassword = String(formData.get("password"));
  const { password, email } = authZod.parse({
    email: formEmail,
    password: formPassword,
  });

  const newId = generateId(20);
  const hashedPassword = await new Scrypt().hash(password);
  try {
    await db
      .insert(TB_users)
      .values({ email: email, password: hashedPassword, id: newId });
  } catch (errors) {
    return json({ ok: false, error: "Email is already registered" }, 400);
  }
  const newSession = await lucia.createSession(newId, {});
  const newSessionCookie = lucia.createSessionCookie(newSession.id);
  return redirect("/", {
    headers: {
      "Set-Cookie": newSessionCookie.serialize(),
    },
  });
}
