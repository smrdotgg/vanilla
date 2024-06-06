import { z } from "zod";


export const INTENTS = {
  "CREATE_SPLITBOX": "CREATE_SPLITBOX" as const,
};

export const formSchema = z.object({
  name: z.string().min(2).max(50),
});
