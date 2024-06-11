/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line react/no-children-prop,
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { readableStreamToString } from "@remix-run/node";
import { createEnumSchema } from "~/lib/zod_enum_schema";
import { api } from "~/server/trpc/server.server";
import { Page } from "./page";

export const loader = async ({request}: LoaderFunctionArgs) => {
  return api(request).contacts.getContacts.query({ cursor: 1 });
};

export { Page as default };

const intentSchema = createEnumSchema(["create", "delete"]);
const deleteSchema = z.object({
  intent: intentSchema,
  data: z.number().array(),
});

const createSchemaRaw = z.object({
  name: z.string(),
  email: z.string().email(),
  company: z.string().nullish(),
});

export const action = async (args: ActionFunctionArgs) => {
  // const requestBody = JSON.parse(
  //   await readableStreamToString(args.request.body!),
  // );
  // const intent = intentSchema.parse(requestBody.intent);
  // if (intent === "create") {
  //   const contactData: z.infer<typeof createSchemaRaw>[] = [];
  //   (requestBody.data as any[]).forEach((datum: any, index) => {
  //     try {
  //       contactData.push(createSchemaRaw.parse(datum));
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   });
  //   await db.insert(TB_contacts).values(contactData);
  // } else if (intent == "delete") {
  //   const contactData = deleteSchema.parse(requestBody);
  //   const idArray = contactData.data.map(Number);
  //   // await db.delete(SO_contacts).where(inArray(SO_contacts.id, idArray));
  //   await db.delete(TB_contacts); //.where(inArray(SO_contacts.id, idArray));
  // }
  // return null;
};
