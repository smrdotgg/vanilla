import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  NewMailboxTinyForm,
  TinyFormSchema,
  TinyFormType,
} from "./components/new_mailbox_form";
import { LuPlus } from "react-icons/lu";
import { loader } from "./route";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { INTENTS } from "./types";

export function Page() {
  const { domains } = useLoaderData<typeof loader>();
  const { submit, state } = useFetcher();

  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);

  const [forms, setForms] = useState<TinyFormType[]>([
    { domain: "", username: "", lastName: undefined, firstName: "" },
  ]);

  const errors = forms.map((form) =>
    hasBeenSubmitted ? TinyFormSchema.safeParse(form).error : undefined
  );

  return (
    <div className="flex w-full flex-col p-6 ">
      <div className="flex justify-between  *:my-auto">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">Add new mailboxes</h1>
        </div>
        <Button
          disabled={state !== "idle"}
          onClick={() => {
            setHasBeenSubmitted(true);
            const networkData = JSON.stringify({
              data: forms,
              intent: INTENTS.createMailboxes,
            });
            submit(networkData, {
              method: "POST",
              encType: "application/json",
            });
          }}
          variant={"default"}
        >
          Create Mailboxes
        </Button>
      </div>
      {/* <TopBar /> */}
      <div className=" flex flex-col gap-2">
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
        {forms.map((formData, index) => (
          <NewMailboxTinyForm
            setForms={setForms}
            key={index}
            index={index}
            forms={forms}
            error={errors[index]}
            // data={formData}
            domains={domains.map((d) => d.name)}
          />
        ))}
      </div>
    </div>
  );
}
