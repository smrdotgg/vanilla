import { Button } from "~/components/ui/button";

export function TopBar() {
  return (
    <div className="flex justify-between  *:my-auto">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold">Add new mailboxes</h1>
      </div>
      <Button variant={"default"}>
Create Mailboxes
      </Button>
    </div>
  );
}

