/* eslint-disable jsx-a11y/no-autofocus */
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  readableStreamToString,
  redirect,
} from "@remix-run/node";
import { Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { ReactNode, useState } from "react";
import { flushSync } from "react-dom";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { db } from "~/db/index.server";
import { useAtomValue, atom } from "jotai";
import {
  SO_analytic_settings,
  SO_binding_campaigns_contacts,
  SO_campaign_sender_email_link,
  SO_campaigns,
  SO_sequence_steps,
} from "~/db/schema.server";
import { createEnumSchema } from "~/lib/zod_enum_schema";
import { PageSelect } from "./page_select";

export type CampaignStatus = {
  basics: boolean;
  contacts: boolean;
  sequence: boolean;
  schedule: boolean;
  senders: boolean;
  settings: boolean;
  launch: boolean;
};

export const sequenceCTAAtom = atom<ReactNode | undefined>(undefined);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  if (
    request.url.endsWith(`campaigns/${params.id}/`) ||
    request.url.endsWith(`campaigns/${params.id}`)
  ) {
    return redirect(`/campaigns/${params.id}/00_basics`);
  }

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

  const analytics = await db
    .select()
    .from(SO_analytic_settings)
    .where(eq(SO_analytic_settings.campaignId, Number(params.id)));

  return {
    basics: Boolean(campaign[0].name),
    campaign: campaign[0],
    contacts: Boolean(campaignContacts.length),
    sequence: Boolean(sequence.length),
    schedule: false,
    senders: Boolean(senders.length),
    settings: Boolean(analytics.length),
    launch: campaign[0].deadline != null,
    result,
  };
};

export default function Page() {
  const data = useLoaderData<typeof loader>();
  const cta = useAtomValue(sequenceCTAAtom);

  return (
    <>
      <div className="flex h-screen max-h-screen flex-col ">
        <div className="flex h-auto justify-between px-6 py-2 *:my-auto">
          <PageSelect
            basics={data.basics}
            contacts={data.contacts}
            sequence={data.sequence}
            schedule={data.schedule}
            senders={data.senders}
            launch={data.launch}
            settings={data.settings}
            campaignId={data.campaign.id}
            data={data.result.params}
          />
          <div className="flex w-60 justify-end">{cta}</div>
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
          className="h-9 p-0 text-3xl font-bold"
          onFocus={(e) => e.target.select()}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => setEditMode(false)}
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
        className=" flex p-0 text-left font-bold"
        variant={"link"}
        onClick={() => {
          setEditMode(true);
        }}
      >
        <p className="text-left text-2xl  text-secondary-foreground">
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
      className="flex h-9 w-60 pb-1  pl-[0.05rem] text-3xl font-bold"
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

export const action = async (args: ActionFunctionArgs) => {
  const body = JSON.parse(await readableStreamToString(args.request.body!));
  const intent = intentSchema.parse(body.intent);
  if (intent == "set_name") {
    const data = setNameSchema.parse(body);
    await db
      .update(SO_campaigns)
      .set({ updatedAt: new Date(), name: data.newName });
  }
  return null;
};

