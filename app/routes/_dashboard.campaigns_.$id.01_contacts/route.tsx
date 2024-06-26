import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  readableStreamToString,
} from "@remix-run/node";
import { contactListSchema } from "./types";
import Page from "./page";
import { api } from "~/server/trpc/server.server";

const getPage = (searchParams: URLSearchParams) =>
  Number(searchParams.get("cursor") || "1");

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const page = getPage(new URL(request.url).searchParams);
  return api(request).campaign.getContacts.query({
    cursor: page,
    getAll: true,
    campaignId: Number(params.id),
  });
};
// export const loader = async ({ request, params }: LoaderFunctionArgs) => {
//   const x = await db
//     .select()
//     .from(SO_contacts)
//     .leftJoin(
//       SO_binding_campaigns_contacts,
//       eq(SO_binding_campaigns_contacts.contactId, SO_contacts.id),
//     )
//     .where(eq(SO_binding_campaigns_contacts.campaignId, Number(params.id)));
//   const selectedContacts: number[] = [];
//   x.forEach((el) => {
//     if (el.campaigns_contacts?.contactId != null)
//       selectedContacts.push(el.campaigns_contacts?.contactId);
//   });
//   const contacts = await db.select().from(SO_contacts);
//
//   return { contacts, selectedContacts };
// };

export { Page as default };

export const action = async (args: ActionFunctionArgs) => {
  const body = await readableStreamToString(args.request.body!);
  const data = contactListSchema.parse(JSON.parse(body));
  await db.transaction(async (db) => {
    await db
      .delete(TB_binding_campaigns_contacts)
      .where(eq(TB_binding_campaigns_contacts.campaignId, data.campaignId));
    if (data.contactIds.length)
      await db.insert(TB_binding_campaigns_contacts).values(
        data.contactIds.map((contactId) => ({
          campaignId: data.campaignId,
          contactId: contactId,
        })),
      );
  });
  return null;
};
