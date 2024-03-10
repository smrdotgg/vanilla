import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { timeAgo } from "~/lib/time_ago";

export function SenderEmailTable({
  contacts,
  selectedContactsMap,
  setSelectedContactsMap,
  formDisabled,
}: {
  contacts?: {
    id: number;
    emailAddr: string;
  }[];
  selectedContactsMap: Set<number>;
  setSelectedContactsMap: (newVal: Set<number>) => void;
  formDisabled?: boolean;
}) {
  if (contacts == undefined) return <></>;
  return (
    <div className=" flex-grow flex overflow-hidden  ">
      <div className="flex flex-col  w-full">
      <div className="flex h-12 min-h-12 w-full justify-between bg-secondary px-6 *:my-auto  ">
        <div className="flex gap-6">
          <Checkbox
            disabled={formDisabled}
            className="my-auto h-5 w-5"
            onCheckedChange={() => {
              if (selectedContactsMap.size == contacts.length) {
                const newVal = new Set<number>();
                setSelectedContactsMap(newVal);
              } else {
                const newVal = new Set<number>();
                contacts.map((c) => newVal.add(c.id));
                setSelectedContactsMap(newVal);
              }
            }}
            checked={
              selectedContactsMap.size > 0 &&
              selectedContactsMap.size == contacts.length
            }
          />
          <h1>Select All ({contacts.length})</h1>
        </div>
        <p>
          {selectedContactsMap.size} Sender Account
          {selectedContactsMap.size == 1 ? "" : "s"} Selected
        </p>
      </div>
      <div className="flex-grow overflow-y-auto">
        {contacts.map((c, i) => (
          <SenderEmailDisplay
            key={i}
            contact={c}
            formDisabled={formDisabled}
            setSelectedContactsMap={setSelectedContactsMap}
            selectedContactsMap={selectedContactsMap}
          />
        ))}
      </div>
      </div>
    </div>
  );
}

function SenderEmailDisplay({
  contact,
  selectedContactsMap,
  setSelectedContactsMap,
  formDisabled,
}: {
  contact: {
    id: number;
    emailAddr: string;
  };
  selectedContactsMap: Set<number>;
  setSelectedContactsMap: (newVal: Set<number>) => void;
  formDisabled?: boolean;
}) {
  const selected = selectedContactsMap.has(contact.id);

  return (
    <div className="flex flex-col ">
      <div className="mr-5 flex  justify-between px-2 *:my-auto">
        <div className="flex gap-2">
          <Checkbox
            disabled={formDisabled}
            onCheckedChange={() => {
              const newVal = new Set(selectedContactsMap);
              if (selected) newVal.delete(contact.id);
              else newVal.add(contact.id);
              setSelectedContactsMap(newVal);
            }}
            checked={selected}
            className="mx-4 my-auto h-5 w-5"
          />

          <div className="flex flex-col gap-1 py-2">
            <div className="flex gap-1">
              <p className="font-bold">{contact.emailAddr}</p>
              {/* <p>{contact.companyName == null ? "" : `-`}</p> */}
              {/* <p> */}
              {/*   {contact.companyName == null ? "" : `${contact.companyName}`} */}
              {/* </p> */}
            </div>
            <p className="text-black dark:text-white">{contact.emailAddr}</p>
            {/* <p className="text-secondary-foreground">Added {timeAgo(contact.createdAt)}</p> */}
          </div>
        </div>
        <Button variant={"outline"}>Manage</Button>
      </div>
      <div className="h-[.5px] w-full dark:bg-gray-700 bg-gray-100"></div>
    </div>
  );
}




