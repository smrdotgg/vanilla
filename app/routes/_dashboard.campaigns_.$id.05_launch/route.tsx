import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { FaRegMessage } from "react-icons/fa6";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { db } from "~/db/index.server";
import { SO_campaigns } from "~/db/schema.server";
import { MdOutlineAccessAlarm } from "react-icons/md";
import { api } from "~/server/trpc/react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const campaign = await db
    .select()
    .from(SO_campaigns)
    .where(eq(SO_campaigns.id, Number(params.id)));

  return campaign[0].deadline == null;
};

export default function Page() {
  const navigate = useNavigate();
  const loaderData = useLoaderData<typeof loader>();
  const setDeadline = api.campaign.setDeadline.useMutation({
    onSuccess: () => {
      toast("Email Campaign is Live!", {
        description: "Your emails will now start to be sent out.",
      });
      navigate("/campaigns");
    },
  });
  const params = useParams();
  const [d, setD] = useState("");
  const [t, setT] = useState("");

  return (
    <div className="flex flex-grow  *:m-auto">
      <div className="flex w-96 flex-col justify-center gap-5">
        {loaderData ? (
          <>
            <h1 className="text-3xl font-bold">Deadline</h1>
            <div className="flex gap-2">
              <Input
                value={d}
                onChange={(e) => setD(e.target.value)}
                type="date"
              />
              <Input
                value={t}
                onChange={(e) => setT(e.target.value)}
                type="time"
              />
            </div>
            <Button
              onClick={() => {
                const dateTime = `${d}T${t}`;
                const dateObject = new Date(dateTime);
                setDeadline.mutate({
                  campaignId: Number(params.id!),
                  deadline: dateObject,
                });
              }}
              className="flex h-12 w-full gap-4 p-1 text-2xl font-semibold"
            >
              <MdOutlineAccessAlarm height={8 * 3} width={8 * 3} />{" "}
              <p>Set Deadline</p>
            </Button>
            <hr />
            <Button
              variant="secondary"
              onClick={() => {
                const dateObject = new Date();
                setDeadline.mutate({
                  campaignId: Number(params.id!),
                  deadline: dateObject,
                });
              }}
              className="flex h-12 w-full gap-4 p-1 text-2xl font-semibold"
            >
              <PaperPlaneIcon height={8 * 3} width={8 * 3} /> <p>Send Now</p>
            </Button>
            <Button
              variant="outline"
              asChild
              className="flex h-12 w-full gap-4 p-1 text-2xl font-semibold"
            >
              <Link prefetch="intent" to="/campaigns">
                <FaRegMessage height={8 * 3} width={8 * 3} />{" "}
                <p>Save as Draft</p>
              </Link>
            </Button>

            {/* <Form method="post"> */}
            {/*   <Button */}
            {/*     type="submit" */}
            {/*     className="flex w-full gap-4 text-2xl font-semibold" */}
            {/*   > */}
            {/*     <PaperPlaneIcon height={8 * 3} width={8 * 3} /> <p>Send</p> */}
            {/*   </Button> */}
            {/* </Form> */}
          </>
        ) : (
          <>
            <h1 className="text-6xl font-bold">Email Campaign is Live</h1>
            <Button
              asChild
              className="flex w-full gap-4 text-2xl font-semibold"
            >
              <Link prefetch="intent" to="/campaigns">
                <p>Campaigns Page</p>
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
