import { z } from "zod";

export const contactListSchema = z.object({
  contactIds: z.number().array(),
  campaignId: z.number(),
});
