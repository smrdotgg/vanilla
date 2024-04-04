import { ClientOnly } from "remix-utils/client-only";
import { z } from "zod";
import { NewEditor } from "./editor.client";
import { NameView } from "./components/title_edit";
import { useFetcher, useFetchers } from "@remix-run/react";
import { INTENTS, deleteEmailSchema } from "./types";
import { Button } from "~/components/ui/button";
import { TrashIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toFormData } from "~/lib/to_form_data";

export const EditEmailPage = ({
  title,
  content,
  id,
  isPlainText,
}: {
  id: number;
  title: string | null;
  content: string | null;
  isPlainText: boolean,
}) => {
  const fetcher = useFetcher();
  const fetchers = useFetchers();

  const setContentWithTwoSecondWait = async (newVal: string) => {
    const fd = new FormData();
    fd.append("intent", INTENTS.updateEmailTitle);
    fd.append("title", newVal);
    fd.append("id", String(id));
    fetcher.submit(fd, { method: "post" });
  };

  if (fetcher.formData !== undefined) {
    title = fetcher.formData.get("title")?.toString() ?? null;
  }

  return (
    <div>
      <div className="flex justify-between p-2 pb-2 *:my-auto">
        <NameView id={id} value={title ?? undefined} />
        <div>
          {fetchers.filter(
            (f) => f.formData?.get("intent") === INTENTS.updateEmailContent,
          ).length > 0 ? (
            <p className="pr-4">Saving ...</p>
          ) : (
            <DeleteIconButton
              onDelete={() => {
                const d: z.infer<typeof deleteEmailSchema> = {
                  emailId: String(id),
                  intent: INTENTS.deleteEmail,
                };
                fetcher.submit(toFormData(d), { method: "post" });
              }}
            />
          )}
        </div>
      </div>

      <ClientOnly fallback={<h1>loading</h1>}>
        {() => <NewEditor isPlainText={isPlainText} id={id} key={id} contentString={content} />}
      </ClientOnly>
    </div>
  );
};

function DeleteIconButton({ onDelete }: { onDelete: () => void }) {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="px-3 py-2 ">
            <TrashIcon className="text-red h-4 w-4 dark:text-white" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Email?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this email?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-1 sm:justify-end">
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={onDelete} variant="destructive">
                Delete
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
