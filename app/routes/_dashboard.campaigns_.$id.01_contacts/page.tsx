import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
  useRevalidator,
  useSearchParams,
} from "@remix-run/react";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { ContactsDisplay } from "../_dashboard.contacts/components/table";
import { Button } from "~/components/ui/button";
import { sequenceCTAAtom } from "../_dashboard.campaigns_.$id/route";
import { loader } from "./route";
import { api } from "~/server/trpc/react";

export default function Page() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { data, cursor, selectedContactIds, contactCount, campaignId } =
    useLoaderData<typeof loader>();
  const [loaded, setLoaded] = useState(false);
  const params = useParams();
  const [allSelectedAdmin, setAllSelectedMode] = useState(false);
  const [selectedId, setSelectedId] = useState(new Set(selectedContactIds));
  const [unselectedIds, setUnselectedIds] = useState(new Set<number>());
  const setCta = useSetAtom(sequenceCTAAtom);
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const updateContactSelection =
    api.campaign.updateContactPairings.useMutation({onSuccess: () => { if(revalidator.state === "idle") revalidator.revalidate();}});

  const nextCursor = () => {
    if (location.search.length === 0) {
      return 2;
    } else {
      const params = new URLSearchParams(location.search.slice(1));
      const cursor = Number(params.get("cursor"));
      return cursor + 1;
    }
  };

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
  }, [params.id, selectedId, setCta]);

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
    if (loaded) {
      setSelectedId(new Set<number>());
      setUnselectedIds(new Set<number>());
    }
  }, [allSelectedAdmin]);

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
        loadMore={() => {
          const params = new URLSearchParams();
          params.set("cursor", String(nextCursor()));
          setSearchParams(params, {
            preventScrollReset: true,
          });
        }}
        contactCount={contactCount}
        rowIsSelected={rowIsSelected}
        unselectedIds={unselectedIds}
        manageRowClick={manageRowClick}
        allSelectedAdmin={allSelectedAdmin}
        contacts={data!.map((d) => ({
          id: d.id,
          name: d.name,
          email: d.email,
          createdAt: new Date(d.createdAt),
          companyName: d.companyName,
        }))}
      />
    </div>
  );
}
