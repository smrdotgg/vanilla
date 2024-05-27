import { postRouter } from "~/server/api/routers/post";
import { senderAccountsRouter } from "./routers/sender_accounts";
import { createTRPCRouter } from "~/server/api/trpc";
import { campaignRouter } from "./routers/campaign";
import { computeRouter } from "./routers/compute";
import { contactsRouter } from "./routers/contacts";
import { analyticsRouter } from "./routers/analytics";
import { sequenceRouter } from "./routers/sequence";
import { domainsRouter } from "./routers/domains";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  compute: computeRouter,
  senderAccounts: senderAccountsRouter,
  campaign: campaignRouter,
  contacts: contactsRouter,
  analytics: analyticsRouter,
  sequence: sequenceRouter,
  domains: domainsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
