import { redirect } from "@remix-run/node";
import { Form, useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { db } from "~/db/index.server";
import { SO_campaigns } from "~/db/schema.server";

export const loader = async () => {
  return null;
};

export default function Page() {
  const fetcher = useFetcher();
  return (
    <>
      <div className="flex h-screen max-h-screen flex-col  py-6">
        <div className="flex justify-between *:my-auto px-6">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">Campaigns</h1>
            <p className="text-gray-500">
              Create a new campaign or track existing sequences.
            </p>
          </div>
          <Form method="post" >
          <Button type="submit"  >Create Campaign</Button>
          </Form>
        </div>
        <div className="pt-2"></div>
        <Input className="w-96 ml-6" placeholder="Search" />
        <div className="pt-6"></div>
      </div>
    </>
  );
}

export const action = async () => {
  const newCampaigns = await db.insert(SO_campaigns).values({}).returning();
  return redirect(`/campaigns/${newCampaigns[0].id}`);
};
