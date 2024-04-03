import { eq } from "drizzle-orm";
import { z } from "zod";
import { SequenceStepTextFormatTypes, SO_sequence_steps } from "~/db/schema.server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const sequenceRouter = createTRPCRouter({
  updateTitle: publicProcedure
    .input(z.object({ title: z.string(), id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(SO_sequence_steps)
        .set({ title: input.title })
        .where(eq(SO_sequence_steps.id, input.id));
    }),
  updateContent: publicProcedure
    .input(z.object({ content: z.string(), id: z.number(), type: z.enum(SequenceStepTextFormatTypes)  }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(SO_sequence_steps)
        .set({ content: input.content, format: input.type })
        .where(eq(SO_sequence_steps.id, input.id));
    }),
});
