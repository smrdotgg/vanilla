import { Link, useFetcher, useLoaderData, useParams } from "@remix-run/react";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { ContactsDisplay } from "../contacts/components/table";
import { Button } from "~/components/ui/button";
import { sequenceCTAAtom } from "../campaigns_.$id/route";
import { loader } from "./route";
import { api } from "~/server/trpc/react";

export default function Page() {
  const { data, cursor, selectedContactIds, contactCount, campaignId } =
    useLoaderData<typeof loader>();
  const [loaded, setLoaded] = useState(false);
  const params = useParams();
  const fetcher = useFetcher();
  const setCta = useSetAtom(sequenceCTAAtom);

  const [allSelectedAdmin, setAllSelectedMode] = useState(false);
  const [selectedId, setSelectedId] = useState(new Set(selectedContactIds));
  const [unselectedIds, setUnselectedIds] = useState(new Set<number>());

  const myQuery = api.campaign.getContacts.useInfiniteQuery(
    { campaignId },
    {
      getNextPageParam: (lastPage) => lastPage.cursor + 1,
      initialCursor: cursor,
    },
  );

  const rowIsSelected = (rowId: number) => {
    if (allSelectedAdmin) {
      return !unselectedIds.has(rowId);
    } else {
      return selectedId.has(rowId);
    }
  };

  const selectedContactCount: number = (() => {
    if (allSelectedAdmin) {
      return contactCount - unselectedIds.size;
    } else {
      return selectedId.size;
    }
  })();

  const manageRowClick = (rowId: number) => {
    const selected = rowIsSelected(rowId);
    if (allSelectedAdmin) {
      if (selected) {
        const newSet = new Set<number>(...[unselectedIds]);
        newSet.add(rowId);
        setUnselectedIds(newSet);
      } else {
        const newSet = new Set<number>(...[unselectedIds]);
        newSet.delete(rowId);
        setUnselectedIds(newSet);
      }
    } else {
      if (selected) {
        const newSet = new Set<number>(...[selectedId]);
        newSet.delete(rowId);
        setSelectedId(newSet);
      } else {
        const newSet = new Set<number>(...[selectedId]);
        newSet.add(rowId);
        setSelectedId(newSet);
      }
    }
  };

  useEffect(() => {
    if (selectedId.size === contactCount && contactCount > 0) {
      setAllSelectedMode(true);
    }
  }, [selectedId, contactCount]);

  useEffect(() => {
    if (
      allSelectedAdmin &&
      unselectedIds.size === contactCount &&
      contactCount > 0
    ) {
      setAllSelectedMode(false);
    }
  }, [unselectedIds, contactCount]);

  useEffect(() => {
    setSelectedId(new Set<number>());
    setUnselectedIds(new Set<number>());
  }, [allSelectedAdmin]);

  const updateContactSelection =
    api.campaign.updateContactPairings.useMutation();

  useEffect(() => {
    setLoaded(true);
    setCta(
      <Button
        onClick={() => {
          updateContactSelection.mutate({
            mode: allSelectedAdmin ? "excludeSpecified" : "useOnlySpecified",
            exceptions: allSelectedAdmin ? [...unselectedIds] : [...selectedId],
            campaignId: campaignId,
          });
          setSelectedId(new Set<number>());
          setAllSelectedMode(false);
          setUnselectedIds(new Set<number>());
        }}
      >
        <Link to={`/campaigns/${params.id}/02_sequence`}>Next</Link>
      </Button>,
    );
    return () => setCta(undefined);
  }, [fetcher, params.id, selectedId, setCta]);

  return (
    <div className="flex flex-col gap-2 overflow-auto">
      <hr />
      <h1 className="mx-6 my-2 text-3xl font-bold">
        Select the contacts you want to target for this campaign.
      </h1>
      <ContactsDisplay
        formDisabled={!loaded}
        selectedContactCount={selectedContactCount}
        setAllSelectedAdmin={setAllSelectedMode}
        loadMore={() => null} // TODO
        contactCount={contactCount}
        rowIsSelected={rowIsSelected}
        unselectedIds={unselectedIds}
        manageRowClick={manageRowClick}
        allSelectedAdmin={false}
        contacts={
          myQuery.data?.pages.map((p) => p.data).flat() ??
          data!.map((d) => ({
            id: d.id,
            name: d.name,
            email: d.email,
            createdAt: new Date(d.createdAt),
            companyName: d.companyName,
          }))
        }
      />
    </div>
  );
}
