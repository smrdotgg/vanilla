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
        <PopoverTrigger className={`flex w-full cursor-pointer p-1`}>
          <div
            className={`${click ? "border-green-600 bg-green-300 dark:bg-green-700 " : " bg-green-200 dark:bg-green-900"}  w-full rounded  border-white p-1  `}
          >
            {hoursToEnglishString(data.lengthInHours)} Break
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-32">
          <div className="flex flex-col gap-2 *:rounded">
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
          fetcher.submit(toFormData(d), { method: "post" });
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
