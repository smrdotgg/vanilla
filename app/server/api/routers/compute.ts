import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  SequenceStepTextFormatTypes,
  TB_sequence_steps,
  TB_splitboxes,
} from "~/db/schema.server";
import { ComputeManager } from "~/lib/contabo";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const computeRouter = createTRPCRouter({
  createSplitbox: protectedProcedure
    .input(z.object({ name: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const data = await ComputeManager.createVPSInstance();
      const newSplitBox = await ctx.db
        .insert(TB_splitboxes)
        .values({
          id: input.id,
          name: input.name,
          userId: ctx.session.user.id,
          computeIdOnHostingPlatform: data.id,
        });
      return newSplitBox;
    }),

  updateContent: publicProcedure
    .input(
      z.object({
        content: z.string(),
        id: z.number(),
        type: z.enum(SequenceStepTextFormatTypes),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(TB_sequence_steps)
        .set({ content: input.content, format: input.type })
        .where(eq(TB_sequence_steps.id, input.id));
    }),
});
