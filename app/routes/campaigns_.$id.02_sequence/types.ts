import { z } from "zod";

export const INTENTS = {
  name: "Semere" as const,
  age: "22" as const,
  updateEmailContent: "UPDATE_EMAIL_CONTENT" as const,
  updateEmailTitle: "UPDATE_EMAIL_TITLE" as const,
  addBreak: "ADD_BREAK" as const,
  addEmail: "ADD_EMAIL" as const,
  updateBreak: "UPDATE_BREAK" as const,
  deleteBreak: "DELETE_BREAK" as const,
  deleteEmail: "DELETE_EMAIL" as const,
};

export const updateEmailContentSchema = z.object({content: z.string(), id: z.string()});

export const updateEmailTitleSchema = z.object({title: z.string(), id: z.string()});


export const addBreakSchema = z.object({ id: z.string(), lengthInHours: z.string()}).passthrough();

export const addEmailSchema = z.object({ campaignId: z.string(), }).passthrough();

export const updateBreakSchema = z.object({ breakId: z.string() , lengthInHours: z.string()}).passthrough();

export const deleteBreakSchema = z.object({ breakId: z.string() }).passthrough();

export const deleteEmailSchema = z.object({ emailId: z.string() }).passthrough();

