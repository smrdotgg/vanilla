import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";
import { prisma } from "~/db/prisma";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Link,
  useFetcher,
  useFetchers,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useState } from "react";
import { z } from "zod";

const nameSchema = z
    .string()
    .min(2)
    .max(30)
    .refine((value) => value !== "undefined")
    .refine((value) => value !== "null");

export async function action({ request }: ActionFunctionArgs) {
  const { uid } = await validateSessionAndRedirectIfInvalid(request);
  // TODO: tidy up _dashboard and _dashboard.create_workspace_ component/action pairing
  const formData = await request.formData();
  const name = String(formData.get("name"));
  const parseResult = nameSchema.safeParse(name);
  if (!parseResult.success) return {error:String(JSON.parse(parseResult.error?.message)[0].message)};
  await prisma.workspace.create({
    data: {
      name,
      workspace_user_join: {
        create: {
          role: "admin",
          user: {
            connect: {
              firebase_id: uid,
            },
          },
        },
      },
    },
  });
  return redirect("/home");
}

export default function Page() {
  const { Form, state, data } = useFetcher<typeof action>();

  const error = data?.error;
  const isLoading = state === "submitting";

  return (
    <div className="flex h-screen w-screen">
      <div className="m-auto flex w-96 flex-col border border-black  p-8">
        <Dialog>
          <DialogHeader>
            <DialogTitle>Create a new workspace</DialogTitle>
          </DialogHeader>
          <Form method="POST" action="/create_workspace">
            <div className="flex flex-col gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input required id="name" name="name" className="col-span-3" />
              </div>
                <p className="ml-auto">{error ? error : <>&nbsp;</>}</p>
            </div>
            <DialogFooter>
              <Button
              asChild
                disabled={isLoading}
                aria-disabled={isLoading}
                type="submit"
                variant="outline"
              >
              <Link to="/home">
                Cancel
              </Link>
              </Button>
              <Button
                disabled={isLoading}
                aria-disabled={isLoading}
                type="submit"
              >
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </Form>
        </Dialog>
      </div>
    </div>
  );
}
