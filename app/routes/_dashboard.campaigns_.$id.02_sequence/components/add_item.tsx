import { CiSquarePlus } from "react-icons/ci";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactNode, useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useFetcher, useParams } from "@remix-run/react";
import { INTENTS, addBreakSchema, addEmailSchema } from "../types";
import { z } from "zod";
import { toFormData } from "~/lib/to_form_data";
import { BreakManagePortal } from "./break_manage_modal";

export function AddItem() {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const fetcher = useFetcher();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <CiSquarePlus
            size={36}
            className="m-auto text-black dark:text-white"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              const data: z.infer<typeof addEmailSchema> = {
                campaignId: params.id!,
                intent: INTENTS.addEmail,
              };
              fetcher.submit(toFormData(data), { method: "post" });
            }}
          >
            Email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Break
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Add New</DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
      <BreakManagePortal
        open={open}
        setOpen={setOpen}
        onSubmit={(val) => {
          let timeInSeconds = 0;
          if (val == "1 Day") {
            timeInSeconds = 24 * 3600;
          } else if (val == "3 Days") {
            timeInSeconds = 3 * 24 * 3600;
          } else if (val == "1 Week") {
            timeInSeconds = 7 * 24 * 3600;
          } else if (val == "2 Weeks") {
            timeInSeconds = 2 * 7 * 24 * 3600;
          } else if (val == "1 Month") {
            timeInSeconds = 30 * 24 * 3600;
          } else {
            timeInSeconds = Number(val);
          }

          const data: z.infer<typeof addBreakSchema> = {
            id: params.id!,
            intent: INTENTS.addBreak,
            lengthInHours: String(timeInSeconds),
          };

          const fd = toFormData(data);
          fetcher.submit(fd, { method: "post" });
        }}
      />
    </>
  );
}
