// import { NewMailboxTinyForm } from "./components/NewMailboxTinyForm";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  NewMailboxTinyForm,
  TinyFormType,
} from "./components/new_mailbox_tiny_form";
import { LuPlus } from "react-icons/lu";
import { TopBar } from "./components/top_bar";
import { loader } from "./route";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { INTENTS } from "./types";

export default function Page() {
  const { domains, mailboxes } = useLoaderData<typeof loader>();
  const { submit, state } = useFetcher();

  const [forms, setForms] = useState<TinyFormType[]>([
    { domain: "", username: "", lastName: "", firstName: "" },
  ]);

  return (
    <div className="flex w-full flex-col p-6 ">
      <div className="flex justify-between  *:my-auto">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">Add new mailboxes</h1>
        </div>
        <Button
          disabled={state !== "idle"}
          onClick={() => {
            const networkData = JSON.stringify({data: forms, intent: INTENTS.createMailboxes});
            submit(networkData, { method: "POST", encType: "application/json" });
          }}
          variant={"default"}
        >
          Create Mailboxes
        </Button>
      </div>
      {/* <TopBar /> */}
      <div className=" flex flex-col gap-2">
        {forms.map((formData, index) => (
          <NewMailboxTinyForm
            setForms={setForms}
            key={index}
            index={index}
            forms={forms}
            // data={formData}
            domains={domains.map((d) => d.name)}
          />
        ))}
        <div className="flex ">
          <Button
            variant={"outline"}
            className="flex gap-2"
            onClick={() =>
              setForms([
                ...forms,
                { domain: "", username: "", lastName: "", firstName: "" },
              ])
            }
          >
            <LuPlus />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
