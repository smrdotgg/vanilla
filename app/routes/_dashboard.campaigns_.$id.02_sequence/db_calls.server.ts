import { eq } from "drizzle-orm";
import { z } from "zod";
import { TB_sequence_breaks, TB_sequence_steps } from "~/db/schema.server";
import {
  addBreakSchema,
  addEmailSchema,
  deleteBreakSchema,
  deleteEmailSchema,
  updateBreakSchema,
  updateEmailContentSchema,
  updateEmailTitleSchema,
} from "./types";

export async function updateEmailTitle({
  id,
  title,
}: z.infer<typeof updateEmailTitleSchema>) {
  await db
    .update(TB_sequence_steps)
    .set({ title })
    .where(eq(TB_sequence_steps.id, Number(id)));
}

export async function deleteEmail({
  emailId,
}: z.infer<typeof deleteEmailSchema>) {
  await db
    .delete(TB_sequence_steps)
    .where(eq(TB_sequence_steps.id, Number(emailId)));
}

export async function deleteBreak({
  breakId,
}: z.infer<typeof deleteBreakSchema>) {
  await db
    .delete(TB_sequence_breaks)
    .where(eq(TB_sequence_breaks.id, Number(breakId)));
}

export async function addEmail({ campaignId }: z.infer<typeof addEmailSchema>) {
  await db.transaction(async (db) => {
    const sequenceCount = (
      await db
        .select({ id: TB_sequence_steps.id })
        .from(TB_sequence_steps)
        .where(eq(TB_sequence_steps.campaignId, Number(campaignId)))
    ).length;
    const breakCount = (
      await db
        .select({ id: TB_sequence_breaks.id })
        .from(TB_sequence_breaks)
        .where(eq(TB_sequence_breaks.campaignId, Number(campaignId)))
    ).length;
    await db.insert(TB_sequence_steps).values({
      index: sequenceCount + breakCount,
      campaignId: Number(campaignId),
    });
  });
}

export async function addBreak({
  id,
  lengthInHours,
}: z.infer<typeof addBreakSchema>) {
  await db.transaction(async (db) => {
    const sequenceCount = (
      await db
        .select({ id: TB_sequence_steps.id })
        .from(TB_sequence_steps)
        .where(eq(TB_sequence_steps.campaignId, Number(id)))
    ).length;
    const breakCount = (
      await db
        .select({ id: TB_sequence_breaks.id })
        .from(TB_sequence_breaks)
        .where(eq(TB_sequence_breaks.campaignId, Number(id)))
    ).length;
    await db.insert(TB_sequence_breaks).values({
      campaignId: Number(id),
      lengthInHours: Number(lengthInHours),
      index: sequenceCount + breakCount,
    });
  });
}

export async function updateBreak({
  breakId,
  lengthInHours,
}: z.infer<typeof updateBreakSchema>) {
  await db
    .update(TB_sequence_breaks)
    .set({ lengthInHours: Number(lengthInHours) })
    .where(eq(TB_sequence_breaks.id, Number(breakId)));
}

export async function newUpdateEmailContent({
  id,
  content,
}: z.infer<typeof updateEmailContentSchema>) {
  await db
    .update(TB_sequence_steps)
    .set({ content })
    .where(eq(TB_sequence_steps.id, Number(id)));
}
