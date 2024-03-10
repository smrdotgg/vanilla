
import {z} from "zod";

export const senderEmailListSchema = z.object({
  senderIds: z.number().array(),
  campaignId: z.number(),
});
