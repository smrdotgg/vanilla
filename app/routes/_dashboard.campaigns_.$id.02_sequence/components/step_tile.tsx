import { useFetchers } from "@remix-run/react";
import { SequenceStep } from "~/db/schema.server";
import { INTENTS } from "../types";
import { ClientOnly } from "remix-utils/client-only";

export function StepTile({
  data,
  selected,
  onClick,
}: {
  data: SequenceStep;
  selected: boolean;
  onClick: () => void;
}) {
  const fetchers = useFetchers();

  let title = data.title;

  const titleUpdates = fetchers.filter(
    (u) =>
      u.formData?.get("id") === String(data.id) &&
      u.formData?.get("intent") === INTENTS.updateEmailTitle,
  );
  if (titleUpdates.length)
    title = titleUpdates.at(-1)!.formData!.get("title")!.toString();

  let content = data.content;
  const contentUpdates = fetchers.filter(
    (u) => u.formData?.get("intent") === INTENTS.updateEmailContent,
  );
  if (contentUpdates.length)
    content = contentUpdates.at(-1)!.formData!.get("content")!.toString();

  return (
    <button onClick={onClick} className="  h-20   w-full  cursor-pointer p-1">
      <div
        className={` flex h-full flex-col p-1 px-2 *:my-auto *:mr-auto ${selected ? "border-white bg-blue-600 text-white" : "border-blue-900 bg-blue-100 dark:bg-blue-950 "} rounded  border   `}
      >
        <p className="text-xl font-bold ">
          {Number(title?.length) > 0 ? title : "Title Not Set"}
        </p>
        <ClientOnly fallback={<p>....</p>}>
          {() => {
            const CUTOFF = 20;
            return (
              <p>
                {extractVisibleTextFromHTML(content ?? "").slice(0, CUTOFF) +
                  (extractVisibleTextFromHTML(content ?? "").length > CUTOFF
                    ? "..."
                    : "")}
              </p>
            );
          }}
        </ClientOnly>
      </div>
    </button>
  );
}
export function extractVisibleTextFromHTML(htmlString: string): string {
  // Use DOMParser to parse the HTML string
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  // Use the documentElement's textContent property to get the visible text
  // textContent returns all the text contained within an element and its descendants
  return doc.documentElement.textContent || "";
}
