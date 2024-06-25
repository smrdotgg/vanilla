import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { workspaceGuard } from "~/app/middlewares/auth.server";
import { prisma } from "~/utils/db";
import { INTENTS } from "./types";
import Page from "./page";
import { NameCheapDomainService } from "~/sdks/namecheap";
import { ErrorBoundary } from "./error";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { user, workspaceMembership } = await workspaceGuard({
    request,
    params,
  });
  const domains = await prisma.domain
    .findMany({
      where: { workspace_id: workspaceMembership.id, deletedAt: null },
      include: { mailbox: true },
    })
    .then(
      async (domains) =>
        await Promise.all(
          domains.map(async (domain) => ({
            ...domain,
            expiresAt: (
              await NameCheapDomainService.getDomainData({ name: domain.name })
            ).ApiResponse.children[3].CommandResponse.children[0]
              .DomainGetInfoResult.children[0].DomainDetails.children[1]
              .ExpiredDate.content,
          }))
        )
    );
  return {
    user,
    domains,
    workspaceMembership,
  };
};

export { Page as default, ErrorBoundary };

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { workspaceMembership } = await workspaceGuard({ request, params });

  const body = await request.formData();
  const intent = body.get("intent");

  if (intent === INTENTS.deleteDomain) {
    const domainId = String(body.get("domainId"));
    if (domainId && domainId !== "null") {
      await prisma.domain.update({
        where: {
          id: Number(domainId),
          workspace_id: workspaceMembership.workspace_id,
        },
        data: { deletedAt: new Date() },
      });
    }
  }
  return null;
};
