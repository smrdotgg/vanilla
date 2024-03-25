import { postRouter } from "~/server/api/routers/post";
import { senderAccountsRouter } from "./routers/sender_accounts";
import { createTRPCRouter } from "~/server/api/trpc";
import { campaignRouter } from "./routers/campaign";
import { contactsRouter } from "./routers/contacts";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  senderAccounts: senderAccountsRouter,
  campaign: campaignRouter,
  contacts: contactsRouter,
// campaignRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
