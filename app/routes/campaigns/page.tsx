import { Form, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { CampaignTable } from "./table";
import { loader } from "./route";

export function Page() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex h-screen max-h-screen flex-col  py-6">
        <div className="flex justify-between px-6 *:my-auto">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">Campaigns</h1>
            <p className="text-gray-500">
              Create a new campaign or track existing sequences.
            </p>
          </div>
          <Form method="post">
            <Button type="submit">Create Campaign</Button>
          </Form>
        </div>
        <div className="pt-2"></div>
        <Input className="ml-6 w-96" placeholder="Search" />
        <div className="pt-6"></div>
        <CampaignTable
          data={data.map((d) => ({
            id: d.id,
            name: d.name,
            isDraft: d.isDraft,
            updatedAt: d.updatedAt,
            contactCount: d.contactCount,
          }))}
        />
      </div>
    </>
  );
}
