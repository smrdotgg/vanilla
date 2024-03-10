import { Link, useFetcher, useLoaderData, useParams } from "@remix-run/react";
import { loader } from "./route";
import { SenderEmailTable } from "./components/sender_email_table";
import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { sequenceCTAAtom } from "../campaigns_.$id/route";
import { Button } from "~/components/ui/button";
import { z } from "zod";
import { senderEmailListSchema } from "./types";

export function ContactsPage() {
  const data = useLoaderData<typeof loader>();
  const [selected, setSelected] = useState(new Set(data.selectedIds.map((sid) => sid.senderEmailId)));
  const [loaded, setLoaded] = useState(false);
  const params = useParams();
  const fetcher = useFetcher();
  const setCta = useSetAtom(sequenceCTAAtom);


  useEffect(() => {
    setLoaded(true);
    setCta(
      <Button
        onClick={() => {
          const data: z.infer<typeof senderEmailListSchema> = {
            campaignId: Number(params.id),
            senderIds: [...selected],
            // contactIds: [...selected],
            // campaignId: Number(params.id),
          };
          fetcher.submit(data, {
            method: "post",
            encType: "application/json",
          });
        }}
      >
        <Link to={`/campaigns/${params.id}/05_launch`}>Next</Link>
      </Button>,
    );
    return () => setCta(undefined);
  }, [fetcher, params.id, selected, setCta]);

  return (
    <div>
      <SenderEmailTable
        selectedContactsMap={selected}
        setSelectedContactsMap={setSelected}
        contacts={data.senderEmails}
        formDisabled={!loaded}
      />
    </div>
  );
}
