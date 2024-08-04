import { z } from "zod";

export const INTENTS = {
  sendTestEmail: {
    name: "sendTestEmail",
    schema: z.object({
      email: z.string().email(),
      domain: z.string(),
      intent: z.literal("sendTestEmail"),
    }),
  },
} as const;
