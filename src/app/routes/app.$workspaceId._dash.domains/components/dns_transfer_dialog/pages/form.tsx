import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { action } from "../../../route";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { LuDelete } from "react-icons/lu";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { INTENTS } from "../../../types";
import { toast } from "sonner";

export function DNSTransferDialog_FormPage({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
}) {
  const [inputStates, setInputStates] = useState([""]);
  const [edited, setEdited] = useState<number[]>([]);
  const fetcher = useFetcher<typeof action>();
  useEffect(() => {
    if (fetcher.data?.ok) {
      if (open) {
        toast("Successfully submitted!", {
          description:
            "Your domains have been submitted to the DNS transfer queue.",
          action: {
            label: "Dismiss",
            onClick: () => {},
          },
        });
      }
      setOpen(false);
    }
    setEdited([]);
  }, [fetcher, setOpen, open]);

  const loading = fetcher.state != "idle";
  const errorString = fetcher.data?.message ?? null;
  let errors: { [key: string]: string };
  try {
    errors = JSON.parse(errorString ?? "{}"); // as (string | null)[];
  } catch (e) {
    errors = {};
  }

  return (
    <>
      <div className="flex justify-between">
        <DialogHeader className="flex">
          <DialogTitle>(DNS) Transfer In Domain</DialogTitle>
          <DialogDescription>
            Enter all the domains you want to transfer in:
          </DialogDescription>
        </DialogHeader>
        <Button
          type="button"
          variant={"secondary"}
          onClick={() => setInputStates([...inputStates, ""])}
        >
          Add
        </Button>
      </div>
      <fetcher.Form method="post">
        <input name="intent" hidden value={INTENTS.transferDomainViaDNS} />
        <input name="inputCount" hidden value={String(inputStates.length)} />
        <div className="flex justify-end *:my-auto"></div>
        <div className="mt-4"></div>
        <div className="flex flex-col gap-3 w-full">
          {inputStates.map((formState, index) => (
            <div key={index} className="w-full flex gap-3">
              <div className="w-full">
                <Input
                  value={formState}
                  onChange={(e) => {
                    setEdited([...edited, index]);
                    setInputStates(
                      inputStates.map((_, i) =>
                        i === index ? e.target.value : _
                      )
                    );
                  }}
                  name={`domains[${index}].name`}
                  autoComplete="off"
                  placeholder={`Domain ${index + 1}`}
                  className="w-full"
                />
                {!edited.includes(index) && errors[String(index)] && (
                  <>
                    <div className="pt-1"></div>
                    <p className="text-red-500">
                      <code className="bg-red-50 p-1 mr-2">{formState}</code>
                      {errors[String(index)]}
                    </p>
                  </>
                )}
              </div>
              {index === 0 ? (
                <></>
              ) : (
                <Button
                  type="button"
                  className="border-red-200 dark:border-red-900"
                  aria-label="delete"
                  title="Delete"
                  variant={"outline"}
                  onClick={() =>
                    setInputStates(inputStates.filter((_, i) => i !== index))
                  }
                >
                  <LuDelete />
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="pt-4"></div>
        <DialogFooter className="flex">
          <div className="w-full flex justify-between *:my-auto">
            {/* {Boolean(error) ? <p>{error}</p> : <p>&nbsp;</p>} */}
            <div className="flex justify-end gap-2">
              <Button disabled={loading} variant="secondary">
                Cancel
              </Button>
              <Button disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </fetcher.Form>
    </>
  );
}
