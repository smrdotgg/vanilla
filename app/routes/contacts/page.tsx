/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line react/no-children-prop,
import { useFetcher, useLoaderData, useRevalidator } from "@remix-run/react";
import { CiFilter } from "react-icons/ci";
import { Button } from "~/components/ui/button";
import { DialogCloseButton } from "./components/add_contacts";
import { ContactsDisplay } from "./components/table";
import { useEffect, useState } from "react";
import { DeleteDialog } from "./components/delete_modal";
import { api } from "~/server/trpc/react";
import { action, loader } from "./route";

export const Page = () => {
  const { contactCount, data, cursor, batchSize, pageCount } =
    useLoaderData<typeof loader>();
  const myQuery = api.contacts.getContacts.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.cursor + 1,
      initialCursor: cursor,
    },
  );
  const { revalidate, state } = useRevalidator();
  const deleteMutation = api.contacts.delete.useMutation({
    onSuccess: () => (state === "idle" ? revalidate() : null),
  });

  const actionSubmitFetcher = useFetcher<typeof action>();
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState(new Set<number>());
  const [allSelectedAdmin, setAllSelectedAdmin] = useState(false);
  const [unselectedIds, setUnselectedIds] = useState(new Set<number>());

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
      setAllSelectedAdmin(true);
    }
  }, [selectedId, contactCount]);

  useEffect(() => {
    if (
      allSelectedAdmin &&
      unselectedIds.size === contactCount &&
      contactCount > 0
    ) {
      setAllSelectedAdmin(false);
    }
  }, [unselectedIds, contactCount]);

  useEffect(() => {
    setSelectedId(new Set<number>());
    setUnselectedIds(new Set<number>());
  }, [allSelectedAdmin]);

  useEffect(() => setLoaded(true), []);
  useEffect(() => {
    myQuery.refetch();
  }, [data]);

  return (
    <div className="flex h-screen flex-grow flex-col   overflow-y-hidden ">
      <div className="h-40 w-full p-4">
        <div className="flex w-full justify-between *:my-auto">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">Contacts</h1>
            <p className="text-gray-500 dark:text-gray-300">
              Manage all your workspace contacts
            </p>
          </div>
          <DialogCloseButton
            onSubmit={(x) => {
              actionSubmitFetcher.submit(
                {
                  data: x,
                  intent: "create",
                },
                {
                  method: "post",
                  encType: "application/json",
                },
              );
            }}
          />
        </div>
        <div className="pt-4"></div>
        <div className="flex justify-between">
          <Button className="flex gap-2 font-semibold " variant={"secondary"}>
            <CiFilter /> Filter your contacts
          </Button>

          {Boolean(selectedContactCount) && (
            <DeleteDialog
              onDelete={() => {
                deleteMutation.mutate({
                  exceptions: allSelectedAdmin
                    ? [...unselectedIds]
                    : [...selectedId],
                  mode: allSelectedAdmin ? "all" : "none",
                });
                setSelectedId(new Set<number>());
                setAllSelectedAdmin(false);
                setUnselectedIds(new Set<number>());
              }}
              size={selectedContactCount}
            />
          )}
        </div>
      </div>
      <ContactsDisplay
        loadMore={() => myQuery.fetchNextPage()}
        rowIsSelected={rowIsSelected}
        manageRowClick={manageRowClick}
        selectedContactCount={selectedContactCount}
        unselectedIds={unselectedIds}
        contactCount={contactCount}
        allSelectedAdmin={allSelectedAdmin}
        setAllSelectedAdmin={setAllSelectedAdmin}
        formDisabled={!loaded}
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
        // contacts={myQuery.data ?? data }
      />

      <div className="pt-4"></div>
      {/* <ContactsPagination /> */}
      <div className="pt-6"></div>
    </div>
  );
};
