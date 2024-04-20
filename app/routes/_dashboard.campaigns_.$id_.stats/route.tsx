import { LoaderFunctionArgs, defer } from "@remix-run/node";
import { Page } from "./page";
import { db } from "~/db/index.server";
import { TB_analytic_settings, TB_campaigns } from "~/db/schema.server";
import { eq } from "drizzle-orm";
import {
  calculateBouncedSteps,
  ctrCalculate,
  openRateCalucalte,
  optOutCalculate,
} from "./router_helpers.server";

export const loader = (args: LoaderFunctionArgs) => {
  const campaignId = Number(args.params.id);

  const campaign = db
    .select()
    .from(TB_campaigns)
    .where(eq(TB_campaigns.id, campaignId))
    .then((v) => v[0]);

  const analyticSettings = db
    .select()
    .from(TB_analytic_settings)
    .where(eq(TB_analytic_settings.campaignId, campaignId))
    .then((data) => {
      if (data.length) {
        return data[0];
      } else {
        return undefined;
      }
    });

  return defer({
    campaign,
    analyticSettings,
    deliverability: calculateBouncedSteps({ db, campaignId }),
    openRate: openRateCalucalte({ db, campaignId }),
    ctr: ctrCalculate({ db, campaignId }),
    optOut: optOutCalculate({ db, campaignId }),
  });
};

export { Page as default };
