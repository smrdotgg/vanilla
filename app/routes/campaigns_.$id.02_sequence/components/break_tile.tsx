import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { SequenceBreak } from "~/db/schema.server";
import { useFetcher, useParams } from "@remix-run/react";
import { INTENTS, deleteBreakSchema, updateBreakSchema } from "../types";
import { z } from "zod";
import { toFormData } from "~/lib/to_form_data";
import { hoursToEnglishString } from "~/lib/time";
import { BreakManagePortal } from "./break_manage_modal";
import { BreakDeleteModal } from "./break_delete_modal";

export function BreakTile({ data }: { data: SequenceBreak }) {
  const [click, setClick] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const params = useParams();
  const fetcher = useFetcher();

  if (fetcher.formData?.get("lengthInHours") != undefined) {
    data.lengthInHours = Number(fetcher.formData?.get("lengthInHours"));
  }

  return (
    <>
      <Popover open={click} onOpenChange={setClick}>
        <PopoverTrigger
          className={`flex cursor-pointer p-1 w-full`}
        >
          <div
            className={`${click ? "dark:bg-green-700 border-green-600 bg-green-300 " : " bg-green-200 dark:bg-green-900"}  p-1 w-full  rounded border-white  `}
          >
          {hoursToEnglishString(data.lengthInHours)} Break
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-32">
          <div className="flex flex-col *:rounded gap-2">
            <Button
              className=" bg-secondary text-secondary-foreground"
              onClick={() => setShowPortal(true)}
            >
              Manage
            </Button>
            <Button
              className="bg-destructive text-destructive-foreground"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <BreakDeleteModal
        setOpen={setShowDeleteModal}
        open={showDeleteModal}
        onDelete={async () => {
          const d: z.infer<typeof deleteBreakSchema> = {
            breakId: String(data.id),
            intent: INTENTS.deleteBreak,
          };
          fetcher.submit(toFormData(d), {method:"post"});
        }}
      />

      <BreakManagePortal
        initialValue={data.lengthInHours}
        onSubmit={async (val) => {
          const d: z.infer<typeof updateBreakSchema> = {
            lengthInHours: val,
            breakId: String(data.id),
            intent: INTENTS.updateBreak,
          };
          fetcher.submit(toFormData(d), { method: "post" });
        }}
        setOpen={setShowPortal}
        open={showPortal}
      />
    </>
  );
}
