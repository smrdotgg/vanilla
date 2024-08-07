import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { ContaboService } from "~/sdks/contabo";
import { DnsimpleService } from "~/sdks/dnsimple";
import { prisma } from "~/utils/db";
import { PointerTable } from "./components/pointer_table";
import { Button } from "~/components/ui/button";
import { DefaultErrorBoundary } from "~/components/custom/my-error-boundary";
import {
  authDomainPointersSet,
  checkReversePointers,
  checkReversePointersWithDNS,
  getPrefixAndCore,
} from "./helpers";
import { ActionFunctionArgs } from "@remix-run/node";
import { adminGuard } from "~/app/middlewares/auth.server";
import { formDataToObj } from "~/utils/forms";
import { INTENTS } from "./types";
import { runBashCommands } from "~/sdks/contabo/helpers/run_bash_command";
import { sendTestEmail } from "./mail.helper";

const fullDomain = (subdomain: string, parent: string) =>
  `${subdomain.length ? subdomain + "." : ""}${parent}`;

export const loader = async () => {
  const domains = await prisma.domain_dns_transfer.findMany({
    include: {
      mailbox_config: {},
    },
  });
  const data = await prisma.domain_email_status.findMany();
  const mailboxes = await prisma.mailbox_config.findMany({
    where: {
      deletedAt: null,
      domain: { name: { in: data.map((d) => d.coreDomain) } },
      domainPrefix: { in: data.map((d) => d.domainPrefix) },
    },
    include: { domain: true },
  });

  return {
    statuses: data.map((row) => {
      const count = mailboxes.filter(
        (m) =>
          m.domainPrefix === row.domainPrefix &&
          m.domain.name === row.coreDomain
      ).length;
      return { ...row, mailboxCount: count };
    }),
  };
};

export default function Page() {
  const data = useLoaderData<typeof loader>();
  const [val, setVal] = useState(0);
  return (
    <div>
      <Button onClick={() => (val ? setVal(0) : setVal(1))}>x</Button>
      {!!val && <pre>{JSON.stringify(data, null, 2)}</pre>}
      {!val && <PointerTable />}
      Pointers
      <Form method="post">
        <Button type="submit">test</Button>
      </Form>
    </div>
  );
}

export const action = async ({ request }: ActionFunctionArgs) => {
  await adminGuard({ request });
  const body = formDataToObj(await request.formData());
  if (body.intent === INTENTS.sendTestEmail.name) {
    const parsedBody = INTENTS.sendTestEmail.schema.parse(body);

    const vpsData = await prisma.vps.findFirst({
      where: { domain: parsedBody.domain },
    });
    if (!vpsData) return { ok: false, error: "Compute not found" };
    const contaboId = vpsData.compute_id_on_hosting_platform;
    const defaultUser = await ContaboService.getVPSInstanceData({
      id: contaboId,
    }).then((r) => r.data.at(0)!.defaultUser);

    await sendTestEmail({
      targetEmail: parsedBody.email,
      domain: parsedBody.domain,
      vpsUser: defaultUser,
    });

    return { ok: true, error: null };
  }
  throw Error("Unhandled Intent");
};

export const shouldRevalidate = () => false;
export { DefaultErrorBoundary as ErrorBoundary };
