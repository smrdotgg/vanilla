/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { Button } from "~/components/ui/button";
import { CiSquarePlus } from "react-icons/ci";
import { db } from "~/db/index.server";
import { SO_sequence_breaks, SO_sequence_steps } from "~/db/schema.server";
import { eq } from "drizzle-orm";
import { useFetchers, useLoaderData } from "@remix-run/react";
import { useState } from "react";
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

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const campaignId = Number(params.id);
  const sequenceSteps = await db
    .select()
    .from(SO_sequence_steps)
    .where(eq(SO_sequence_steps.campaignId, campaignId));
  const sequenceBreaks = await db
    .select()
    .from(SO_sequence_breaks)
    .where(eq(SO_sequence_breaks.campaignId, campaignId));
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

  return (
    <div className=" flex-grow flex max-h-full overflow-y-auto ">
      <div className="flex w-full h-full">
        <div className="pl-1"></div>
        <div className=" w-96 bg-secondary border border-l-black flex flex-col *:w-full">
          <div className="flex justify-between *:my-auto">
            <p className="p-2 text-xl">Emails</p>
            <AddItem />
          </div>
          {data.order.map((orderElement, i) => (
            <div key={i}>
              {orderElement.type === "break" ? (
                <BreakTile data={data.breaks[orderElement.id]} />
              ) : (
                <StepTile
                  selected={selected == orderElement.id}
                  onClick={() => setSelected(orderElement.id)}
                  data={{
                    ...data.steps[orderElement.id],
                    createdAt: new Date(data.steps[orderElement.id].createdAt),
                    updatedAt: new Date(data.steps[orderElement.id].updatedAt),
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="pl-1"></div>
        <div className="flex-grow flex flex-col overflow-y-auto  h-full bg-secondary">
          {selected !== undefined && data.steps[selected!] !== undefined ? (
            <EditEmailPage
              id={selected!}
              content={data.steps[selected].content}
              title={data.steps[selected].title}
            />
          ) : (<></>)
          }
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
  }  else if (intent === INTENTS.deleteEmail) {
    await deleteEmail(await zx.parseForm(fd, deleteEmailSchema));
  }else {
    console.log("default");
  }

  return { ok: true };
};
