import { useRef, useCallback, useEffect, MutableRefObject } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { timeAgo } from "~/lib/time_ago";

export function ContactsDisplay({
  contacts,
  rowIsSelected,
  manageRowClick,
  unselectedIds,
  selectedContactCount,
  contactCount,
  allSelectedAdmin,
  setAllSelectedAdmin,
  formDisabled,
  loadMore,
}: {
  contacts?: {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    companyName: string | null;
  }[];
  contactCount: number;
  unselectedIds: Set<number>;
  rowIsSelected: (rowId: number) => boolean;
  manageRowClick: (rowId: number) => void;
  selectedContactCount: number;
  allSelectedAdmin: boolean;
  setAllSelectedAdmin: (newVal: boolean) => void;
  formDisabled?: boolean;
  loadMore: () => void;
}) {
  const scrollableDivRef = useRef<HTMLDivElement | null>(null);
  const bottomThreshold = 100;
  if (contacts == undefined) return <>Loading</>;
  return (
    <div className=" flex flex-grow overflow-hidden  ">
      <div className="flex w-full  flex-col">
        <div className="flex h-12 min-h-12 w-full justify-between bg-secondary px-6 *:my-auto  ">
          <div className="flex gap-6">
            <Checkbox
              disabled={formDisabled}
              className="my-auto h-5 w-5"
              onCheckedChange={(newVal) => {
                setAllSelectedAdmin(!allSelectedAdmin);
              }}
              checked={allSelectedAdmin && unselectedIds.size === 0}
            />
            <h1>Select All ({contactCount})</h1>
          </div>
          <p>
            {selectedContactCount} Contact
            {selectedContactCount == 1 ? "" : "s"} Selected
          </p>
        </div>
        <div className="flex-grow overflow-y-auto" ref={scrollableDivRef}>
          {contacts.map((c, i) => (
            <ContactDisplay
              rowIsSelected={rowIsSelected}
              key={i}
              contact={c}
              formDisabled={formDisabled}
              manageRowClick={manageRowClick}
            />
          ))}
          { contactCount > contacts.length &&
          <div className="flex p-4 *:m-auto">
            <Button onClick={loadMore}>Load More</Button>
          </div>
          }
        </div>
      </div>
    </div>
  );
}


function ContactDisplay({
  contact,
  formDisabled,
  manageRowClick,
  rowIsSelected,
}: {
  contact: {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    companyName: string | null;
  };
  formDisabled?: boolean;
  manageRowClick: (rowId: number) => void;
  rowIsSelected: (rowId: number) => boolean;
}) {
  return (
    <div className="flex flex-col " >
      <div className="mr-5 flex  justify-between px-2 *:my-auto">
        <div className="flex gap-2">
          <Checkbox
            disabled={formDisabled}
            onCheckedChange={(_) => manageRowClick(contact.id)}
            checked={rowIsSelected(contact.id)}
            className="mx-4 my-auto h-5 w-5"
          />

          <div className="flex flex-col gap-1 py-2">
            <div className="flex gap-1">
              <p className="font-bold">{contact.name}</p>
              <p>{contact.companyName == null ? "" : `-`}</p>
              <p>
                {contact.companyName == null ? "" : `${contact.companyName}`}
              </p>
            </div>
            <p className="text-black dark:text-white">{contact.email}</p>
            <p className="text-secondary-foreground">
              Added {timeAgo(contact.createdAt)}
            </p>
          </div>
        </div>
        <Button variant={"outline"}>Manage</Button>
      </div>
      <div className="h-[.5px] w-full bg-gray-100 dark:bg-gray-700"></div>
    </div>
  );
}
