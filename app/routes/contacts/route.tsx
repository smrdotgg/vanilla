/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line react/no-children-prop,
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { CiFilter } from "react-icons/ci";
import { Button } from "~/components/ui/button";
import { db } from "~/db/index.server";
import { SO_contacts } from "~/db/schema.server";
import { DialogCloseButton } from "./components/add_contacts";
import { z } from "zod";
import { readableStreamToString } from "@remix-run/node";
import { ContactsDisplay } from "./components/table";
import { createEnumSchema } from "~/lib/zod_enum_schema";
import { inArray } from "drizzle-orm";
import { useEffect, useState } from "react";
import { DeleteDialog } from "./components/delete_modal";

export const loader = async (args: LoaderFunctionArgs) => {
  return await db.select().from(SO_contacts);
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState(new Set<number>());

  useEffect(() => setLoaded(true), []);

  return (
    <div className="flex h-screen flex-grow flex-col  gap-10 overflow-y-hidden ">
      <div className="h-24 w-full p-4">
        <div className="flex w-full justify-between *:my-auto">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">Contacts</h1>
            <p className="text-gray-500 dark:text-gray-300">
              Manage all your workspace contacts
            </p>
          </div>
          <DialogCloseButton
            onSubmit={(x) => {
              fetcher.submit(
                {
                  intent: "create",
                  data: x,
                },
                {
                  method: "post",
                  encType: "application/json",
                },
              );
            }}
          />
        </div>
        <div className="pt-4"></div>
        <div className="flex justify-between">
          <Button className="flex gap-2 font-semibold " variant={"secondary"}>
            <CiFilter /> Filter your contacts
          </Button>

          {Boolean(selectedId.size) && (
            <DeleteDialog
              onDelete={() => {
                setSelectedId(new Set<number>());
                fetcher.submit(
                  {
                    intent: "delete",
                    data: [...selectedId],
                  },
                  {
                    method: "post",
                    encType: "application/json",
                  },
                );
              }}
              size={selectedId.size}
            />
          )}
        </div>
      </div>
      <ContactsDisplay
        formDisabled={!loaded}
        selectedContactsMap={selectedId}
        setSelectedContactsMap={setSelectedId}
        contacts={data!.map((d) => ({
          id: d.id,
          name: d.name,
          email: d.email,
          createdAt: new Date(d.createdAt),
          companyName: d.companyName,
        }))}
      />
    </div>
  );
}

const intentSchema = createEnumSchema(["create", "delete"]);
const deleteSchema = z.object({
  intent: intentSchema,
  data: z.number().array(),
});

const createSchema = z.object({
  intent: intentSchema,
  data: z
    .object({
      name: z.string(),
      email: z.string().email(),
      company: z.string().nullish(),
    })
    .array(),
});

export const action = async (args: ActionFunctionArgs) => {
  const requestBody = JSON.parse(
    await readableStreamToString(args.request.body!),
  );
  const intent = intentSchema.parse(requestBody.intent);
  if (intent === "create") {
    const contactData = createSchema.parse(requestBody).data;
    await db.insert(SO_contacts).values(contactData);
  } else if (intent == "delete") {
    const contactData = deleteSchema.parse(requestBody);
    const idArray = contactData.data.map(Number);
    await db.delete(SO_contacts).where(inArray(SO_contacts.id, idArray));
  }
  return null;
};
