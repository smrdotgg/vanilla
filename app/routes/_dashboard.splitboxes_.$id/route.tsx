import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Page } from "./page";
import { prisma } from "~/db/prisma";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";
import { getVPSInstanceData } from "~/lib/contabo";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userData = await validateSessionAndRedirectIfInvalid(request);
  const computeId = params["id"];
  const computeObj = await prisma.splitbox.findFirst({
    where: {
      id: Number(computeId),
      workspace: {
        workspace_user_join: { some: { user: { firebase_id: userData.uid } } },
      },
    },
  });
  if (computeObj === null) return redirect("/splitboxes");
  const contaboData = (await getVPSInstanceData({
    id: String(computeObj.compute_id_on_hosting_platform),
  })).data[0];
  return { contaboData, computeObj };
};

export { Page as default };
