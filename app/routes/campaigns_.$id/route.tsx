/* eslint-disable jsx-a11y/no-autofocus */
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  readableStreamToString,
} from "@remix-run/node";
import { Outlet, useFetcher, useLoaderData, useParams } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { ReactNode, useState } from "react";
import { flushSync } from "react-dom";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { db } from "~/db/index.server";
import { useAtomValue, atom } from "jotai";
import {
  SO_binding_campaigns_contacts,
  SO_campaign_sender_email_link,
  SO_campaigns,
  SO_contacts,
  SO_sender_emails,
  SO_sequence_steps,
} from "~/db/schema.server";
import { createEnumSchema } from "~/lib/zod_enum_schema";
import { PageSelect } from "./page_select";

export type CampaignStatus = {
  contacts: boolean;
  sequence: boolean;
  schedule: boolean;
  settings: boolean;
  launch: boolean;
};

export const sequenceCTAAtom = atom<ReactNode | undefined>(undefined);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const campaignContacts = await db
    .select()
    .from(SO_binding_campaigns_contacts)
    .where(eq(SO_binding_campaigns_contacts.campaignId, Number(params.id)));
  const campaign = await db
    .select()
    .from(SO_campaigns)
    .where(eq(SO_campaigns.id, Number(params.id)));

  const url = new URL(request.url);
  const qParams = Object.fromEntries(url.searchParams);
  const result = {
    pathname: url.pathname,
    params: qParams,
  };

  const sequence = await db
    .select()
    .from(SO_sequence_steps)
    .where(eq(SO_sequence_steps.campaignId, Number(params.id)));

  const senders = await db
    .select()
    .from(SO_campaign_sender_email_link)
    .where(eq(SO_campaign_sender_email_link.campaignId, Number(params.id)));

  return {
    campaign: campaign[0],
    contacts: Boolean(campaignContacts.length),
    sequence: Boolean(sequence.length),
    schedule: false,
    settings: Boolean(senders.length),
    launch: false,
    result,
  };
};

export default function Page() {
  const data = useLoaderData<typeof loader>();
  const nameFetcher = useFetcher();
  const cta = useAtomValue(sequenceCTAAtom);
  const name =
    nameFetcher.json == null
      ? data.campaign.name
      : JSON.parse(JSON.stringify(nameFetcher.json)).newName;

  return (
    <>
      <div className="flex h-screen max-h-screen flex-col ">
        <div className="flex justify-between *:my-auto py-2 px-6 h-auto">
          <div className="flex flex-col justify-start align-baseline">
            <NameView
              onSubmit={(val) => {
                const fd = new FormData();
                fd.append("name", val);
                nameFetcher.submit(
                  {
                    intent: "set_name",
                    newName: val,
                    id: Number(data.campaign.id),
                  },
                  { encType: "application/json", method: "post" },
                );
              }}
              name={name}
            />
            <p className="text-gray-500">Manage your campaign contacts.</p>
          </div>
          <PageSelect
            contacts={data.contacts}
            sequence={data.sequence}
            schedule={data.schedule}
            settings={data.settings}
            launch={data.launch}
            campaignId={data.campaign.id}
            data={data.result.params}
          />
          <div className="w-60 flex justify-end">{cta}</div>
        </div>
        <Outlet />
      </div>
    </>
  );
}

export const NameView = ({
  name,
  notSetView: itemName,
  onSubmit,
}: {
  name: FormDataEntryValue | null;
  notSetView?: string;
  onSubmit: (val: string) => void;
}) => {
  const [editMode, setEditMode] = useState(false);
  const [val, setVal] = useState(name?.toString() ?? "");
  const submit = () => flushSync(() => onSubmit(val));
  itemName = itemName ?? "Campaign Title";

  if (editMode) {
    return (
      <div className="w-60">
        <Input
          className="p-0 h-9 font-bold text-3xl"
          onFocus={(e) => e.target.select()}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => {
            setEditMode(false);
          }}
          onSubmit={submit}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.code === "Enter") {
              submit();
              setEditMode(false);
            }
          }}
          autoFocus={true}
          placeholder={itemName}
        />
      </div>
    );
  }

  if (name == null || val == null || val!.toString().length == 0) {
    return (
      <Button
        className=" flex text-left font-bold p-0"
        variant={"link"}
        onClick={() => {
          setEditMode(true);
        }}
      >
        <p className="text-secondary-foreground text-2xl  text-left">
          {itemName} not Set
        </p>
        <div className="flex-grow"></div>
      </Button>
    );
  }

  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
  return (
    <button
      onClick={() => setEditMode(true)}
      className="pb-1 w-60 flex pl-[0.05rem]  h-9 font-bold text-3xl"
    >
      <p>{name.toString()}</p>
    </button>
  );
};

const intentSchema = createEnumSchema(["set_name"]);

const setNameSchema = z.object({
  intent: intentSchema,
  newName: z.string(),
  id: z.number(),
});

// const deleteSchema = z.object({
//   intent: intentSchema,
//   data: z.number().array(),
// });

export const action = async (args: ActionFunctionArgs) => {
  const body = JSON.parse(await readableStreamToString(args.request.body!));
  const intent = intentSchema.parse(body.intent);
  if (intent == "set_name") {
    const data = setNameSchema.parse(body);
    await db.update(SO_campaigns).set({ name: data.newName });
  }
  return null;
};
