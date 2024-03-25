import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  readableStreamToString,
} from "@remix-run/node";
import {
  Link,
  useFetcher,
  useLoaderData,
  useLocation,
  useParams,
} from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { db } from "~/db/index.server";
import { SO_binding_campaigns_contacts, SO_contacts } from "~/db/schema.server";
import { ContactsDisplay } from "../contacts/components/table";
import { Button } from "~/components/ui/button";
import { sequenceCTAAtom } from "../campaigns_.$id/route";
import { contactListSchema } from "./types";
import { zx } from "zodix";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const x = await db
    .select()
    .from(SO_contacts)
    .leftJoin(
      SO_binding_campaigns_contacts,
      eq(SO_binding_campaigns_contacts.contactId, SO_contacts.id),
    )
    .where(eq(SO_binding_campaigns_contacts.campaignId, Number(params.id)));
  const selectedContacts: number[] = [];
  x.forEach((el) => {
    if (el.campaigns_contacts?.contactId != null)
      selectedContacts.push(el.campaigns_contacts?.contactId);
  });
  const contacts = await db.select().from(SO_contacts);

  return { contacts, selectedContacts };
};

export default function ContactsPage() {
  const data = useLoaderData<typeof loader>();
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState(
    new Set(data.selectedContacts.map(Number)),
  );
  const params = useParams();
  const fetcher = useFetcher();
  const setCta = useSetAtom(sequenceCTAAtom);
  useEffect(() => {
    setLoaded(true);
    setCta(
      <Button
        onClick={() => {
          const data = {
            contactIds: [...selectedId],
            campaignId: Number(params.id),
          };
          fetcher.submit(data, {
            method: "post",
            encType: "application/json",
          });
        }}
      >
        <Link to={`/campaigns/${params.id}/02_sequence`}>Next</Link>
      </Button>,
    );
    return () => setCta(undefined);
  }, [fetcher, params.id, selectedId, setCta]);

  return (
    <div className="flex flex-col gap-2 overflow-auto">
      <hr />
      <h1 className="mx-6 my-2 text-3xl font-bold">
        Select the contacts you want to target for this campaign.
      </h1>
      <ContactsDisplay
        formDisabled={!loaded}
        selectedContactCount={selectedId.size}
        setAllSelectedAdmin={(v) => null}
        loadMore={() => null}
        contactCount={data!.contacts.length}
        rowIsSelected={(n) => selectedId.has(n)}
        unselectedIds={new Set<number>()}
        manageRowClick={(n) => null}
        allSelectedAdmin={false}
        contacts={data!.contacts.map((d) => ({
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

export const action = async (args: ActionFunctionArgs) => {
  const body = await readableStreamToString(args.request.body!);
  const data = contactListSchema.parse(JSON.parse(body));
  await db.transaction(async (db) => {
    await db
      .delete(SO_binding_campaigns_contacts)
      .where(eq(SO_binding_campaigns_contacts.campaignId, data.campaignId));
    if (data.contactIds.length)
      await db.insert(SO_binding_campaigns_contacts).values(
        data.contactIds.map((contactId) => ({
          campaignId: data.campaignId,
          contactId: contactId,
        })),
      );
  });
  return null;
};
