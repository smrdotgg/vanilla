import {
  Link,
  useFetcher,
  useLoaderData,
  useParams,
  useRevalidator,
} from "@remix-run/react";
import { loader } from "./route";
import { SenderEmailTable } from "./components/sender_email_table";
import { ReactNode, useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { sequenceCTAAtom } from "../campaigns_.$id/route";
import { Button } from "~/components/ui/button";
import { z } from "zod";
import { senderEmailListSchema } from "./types";
import { api } from "~/server/trpc/react";




export function ContactsPage() {
  const data = useLoaderData<typeof loader>();
  // const [optimisitcData, setOptimisticData] = useOptimistic();
  const [selected, setSelected] = useState(
    new Set(data.selectedSenders.map((sid) => sid.senderEmailId)),
  );
  const [loaded, setLoaded] = useState(false);
  const params = useParams();
  const fetcher = useFetcher();
  const setCta = useSetAtom(sequenceCTAAtom);
  const setSelectedServer = api.senderAccounts;
  const revalidator = useRevalidator();
  const setIds = api.senderAccounts.setSelected.useMutation({
    onSuccess: () => revalidator.revalidate(),
  });

  useEffect(() => {
    setLoaded(true);
    setCta(
      <Button
        onClick={() =>
          setIds.mutate({ campaignId: Number(params.id), ids: [...selected] })
        }
        asChild
      >
        <Link to={`/campaigns/${params.id}/04_settings`}>Next</Link>
      </Button>,
    );
    return () => setCta(undefined);
  }, [fetcher, params.id, selected, setCta]);

  return (
    <div className="">
      <hr />
      <h1 className="mx-6 my-2 text-3xl font-bold">
        Select the sender accounts you want to send your emails from for this
        campaign.
      </h1>
      <SenderEmailTable
        selectedContactsMap={selected}
        setSelectedContactsMap={setSelected}
        contacts={data.senderAccounts}
        formDisabled={!loaded}
      />
    </div>
  );
}
