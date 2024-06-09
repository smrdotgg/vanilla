import Page from "./page";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { validateSessionAndRedirectIfInvalid } from "~/auth/firebase/auth.server";
import { prisma } from "~/db/prisma";
import { getUserWorkspaceIdFromCookie } from "~/cookies/workspace";
import {
  ComputeManager,
  cancelInstance,
  reinstateIntance,
} from "~/lib/contabo";
import { getDomainData } from "~/services/domain.server/NameCheapDomainService";
import { INTENTS } from "./types";
import { validateWorkspaceAndRedirectIfInvalid } from "~/auth/workspace";

export async function loader({ request }: LoaderFunctionArgs) {
  const userWorkspaceId = await getUserWorkspaceIdFromCookie({ request });

  const data = await validateSessionAndRedirectIfInvalid(request).then(
    async () => ({
      data: await prisma.workspace.findUnique({
        where: { id: Number(userWorkspaceId) },
        include: {
          domain: {
            where: { deletedAt: null },
            include: { mailbox: true, vps: true },
          },
        },
      }),
    }),
  );
  const domainData = await Promise.all(
    data.data!.domain.map(async (d) => ({
      ...d,
      expiresAt: (await getDomainData({ name: d.name })).ApiResponse.children[3]
        .CommandResponse.children[0].DomainGetInfoResult.children[0]
        .DomainDetails.children[1].ExpiredDate.content,
    })),
  );
  const computeInstances = await Promise.all(
    data
      .data!.domain.map((d) => d.vps)
      .flat()
      .filter((d) => d !== null)
      .map((ci) =>
        ComputeManager.getVPSInstanceData({
          id: ci!.compute_id_on_hosting_platform,
        }).then((r) => r.data[0]),
      ),
  );

  return { data: domainData, computeInstances };
}

export { Page as default };

export async function action({ request }: ActionFunctionArgs) {
  const { userWorkspaceId } = await validateWorkspaceAndRedirectIfInvalid({
    request,
  });

  const formData = await request.formData();
  const intent = String(formData.get("intent"));
  if (intent === INTENTS.deleteDomain) {
    const domainId = String(formData.get("domainId"));
    await prisma.domain.update({
      where: { id: Number(domainId), workspace_id: userWorkspaceId },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  return null;
}
