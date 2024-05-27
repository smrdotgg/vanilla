/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";


import { Button } from "~/components/ui/button";
import { CiSquarePlus } from "react-icons/ci";
import { db } from "~/db/index.server";
import { TB_sequence_breaks, TB_sequence_steps } from "~/db/schema.server";
import { eq } from "drizzle-orm";
import { Link, useFetchers, useLoaderData, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { EditEmailPage } from "./edit_email";
import { BreakTile } from "./components/break_tile";
import { StepTile } from "./components/step_tile";
import { zx } from "zodix";
import { z } from "zod";
import {
  INTENTS,
  addBreakSchema,
  addEmailSchema,
  deleteBreakSchema,
  deleteEmailSchema,
  updateBreakSchema,
  updateEmailContentSchema,
  updateEmailTitleSchema,
} from "./types";
import {
  addBreak,
  addEmail,
  deleteBreak,
  deleteEmail,
  newUpdateEmailContent,
  updateBreak,
  updateEmailTitle,
} from "./db_calls.server";
import { AddItem } from "./components/add_item";
import { JSX } from "react/jsx-runtime";
import { useSetAtom } from "jotai";
import { sequenceCTAAtom } from "../_dashboard.campaigns_.$id/route";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const campaignId = Number(params.id);
  const sequenceSteps = await db
    .select()
    .from(TB_sequence_steps)
    .where(eq(TB_sequence_steps.campaignId, campaignId));
  const sequenceBreaks = await db
    .select()
    .from(TB_sequence_breaks)
    .where(eq(TB_sequence_breaks.campaignId, campaignId));
  const stepsObject = Object.fromEntries(sequenceSteps.map((s) => [s.id, s]));
  const breaksObject = Object.fromEntries(sequenceBreaks.map((s) => [s.id, s]));
  const combined = [
    ...sequenceSteps.map((s) => ({ id: s.id, type: "step", index: s.index })),
    ...sequenceBreaks.map((s) => ({ id: s.id, type: "break", index: s.index })),
  ];
  combined.sort((a, b) => a.index - b.index);
  return { order: combined, steps: stepsObject, breaks: breaksObject };
};

export default function ContactsPage() {
  const data = useLoaderData<typeof loader>();
  const [selected, setSelected] = useState<number | undefined>(undefined);

  const params = useParams();
  const setCta = useSetAtom(sequenceCTAAtom);
  useEffect(() => {
    setCta(
      <Button asChild>
        <Link to={`/campaigns/${params.id}/03_sender_accounts`}>Next</Link>
      </Button>,
    );
    return () => setCta(undefined);
  }, []);
  return (
    <div className="flex h-full flex-col ">
      <hr />
      <h1 className="mx-6 my-2 text-3xl font-bold">
        Setup the your emails. You can add breaks between them.
      </h1>
      <div className=" flex  flex-grow overflow-y-auto ">
        <div className="flex w-full  flex-grow">
          <div className="pl-1"></div>
          <div className=" flex max-w-80 min-w-80 flex-col border border-l-black bg-secondary *:w-full">
            <div className="flex justify-between *:my-auto">
              <p className="p-2 text-xl">Emails &amp; Breaks</p>
              <AddItem />
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto">
              {data.order.map((orderElement, i) => (
                <div index={i}>
                  {orderElement.type === "break" ? (
                    <BreakTile data={data.breaks[orderElement.id]} />
                  ) : (
                    <StepTile
                      selected={selected == orderElement.id}
                      onClick={() => setSelected(orderElement.id)}
                      data={{
                        ...data.steps[orderElement.id],
                        createdAt: new Date(
                          data.steps[orderElement.id].createdAt,
                        ),
                        updatedAt: new Date(
                          data.steps[orderElement.id].updatedAt,
                        ),
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="pl-1"></div>
          <div className="flex h-full flex-grow flex-col  overflow-y-auto bg-secondary">
            {selected !== undefined && data.steps[selected!] !== undefined ? (
              <EditEmailPage
                id={selected!}
                content={data.steps[selected].content}
                isPlainText={data.steps[selected].format == "plain"}
                title={data.steps[selected].title}
              />
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const fd = await request.formData();
  const intent = fd.get("intent");

  let form: any = {};
  if (intent === INTENTS.updateEmailContent) {
    await newUpdateEmailContent(
      await zx.parseForm(fd, updateEmailContentSchema),
    );
  } else if (intent === INTENTS.updateEmailTitle) {
    form = await zx.parseForm(fd, updateEmailTitleSchema);
    await updateEmailTitle(form);
  } else if (intent === INTENTS.addBreak) {
    await addBreak(await zx.parseForm(fd, addBreakSchema));
  } else if (intent === INTENTS.updateBreak) {
    await updateBreak(await zx.parseForm(fd, updateBreakSchema));
  } else if (intent === INTENTS.deleteBreak) {
    await deleteBreak(await zx.parseForm(fd, deleteBreakSchema));
  } else if (intent === INTENTS.addEmail) {
    await addEmail(await zx.parseForm(fd, addEmailSchema));
  } else if (intent === INTENTS.deleteEmail) {
    await deleteEmail(await zx.parseForm(fd, deleteEmailSchema));
  } else {
    console.log("default");
  }

  return { ok: true };
};
