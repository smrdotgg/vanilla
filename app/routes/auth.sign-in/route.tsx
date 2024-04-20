import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { Scrypt } from "lucia";
import { z } from "zod";
import { lucia } from "~/auth/lucia.server";
import { ContinueWithGoogleButton } from "~/components/auth/google";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { db } from "~/db/index.server";
import { TB_users } from "~/db/schema.server";

export default function Page() {
  return (
    <div className="flex h-screen *:m-auto">
      <div className="w-96 flex flex-col gap-3 align-bottom">
        <h1>Sign In Form</h1>
        <Form method="post" className="flex flex-col gap-3 align-bottom">
          <Input name="email" type="email" placeholder="email" />
          <Input name="password" type="password" placeholder="password" />
          <Button type="submit">Submit</Button>
        </Form>
        <Link to="/auth/sign-up">
          Sign Up
        </Link>
        <ContinueWithGoogleButton />
      </div>
    </div>
  );
}

const authZod = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const action = async (args: ActionFunctionArgs) => {
  const formData = await args.request.formData();
  const formEmail = String(formData.get("email"));
  const formPassword = String(formData.get("password"));
  const { password, email } = authZod.parse({
    email: formEmail,
    password: formPassword,
  });

  const user = await db
    .select()
    .from(TB_users)
    .where(eq(TB_users.email, email));

  if (user.length === 0) throw new Error();

  if (user[0].password === null) throw new Error();

  const passwordIsCorrect = await new Scrypt().verify(
    user[0].password,
    password,
  );
  if (!passwordIsCorrect) throw new Error();

  const newSession = await lucia.createSession(user[0].id, {});
  const newSessionCookie = lucia.createSessionCookie(newSession.id);
  return redirect("/", {
    headers: {
      "Set-Cookie": newSessionCookie.serialize(),
    },
  });
};

