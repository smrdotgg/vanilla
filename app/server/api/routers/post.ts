import { z } from "zod";
import { TB_posts } from "~/db/schema.server";

import {
  createTRPCRouter,
  // protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
// import { posts } from "~/server/db/schema";

let x = 0;
export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      console.log("GOT REQUEST");
      x += 1;
      return {
        greeting: `Hello ${input.text} for the ${x}th time`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await ctx.db.insert(TB_posts).values({
        name: "",
        // name: input.name,
        // createdById: ctx.session.user.id,
      });
    }),

  getSecretMessage: publicProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
