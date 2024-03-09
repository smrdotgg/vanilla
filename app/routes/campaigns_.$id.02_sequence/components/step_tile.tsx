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
    (u) => u.formData?.get("intent") === INTENTS.updateEmailTitle,
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
    <button
      onClick={onClick}
      className={`  h-20   cursor-pointer  p-1 w-full`}
    >
      <div
        className={` flex flex-col px-2 *:mr-auto *:my-auto h-full p-1 ${selected ? "text-white bg-blue-600 border-white" : "bg-blue-100 dark:bg-blue-950 border-blue-900 "} rounded  border   `}
      >
        <p className="text-xl font-bold">{title ?? "Title Not Set"}</p>
        <ClientOnly fallback={<h1>....</h1>}>
          {() => <p>{extractVisibleTextFromHTML(content ?? "")}</p>}
        </ClientOnly>
      </div>
    </button>
  );
}
function extractVisibleTextFromHTML(htmlString: string): string {
  // Use DOMParser to parse the HTML string
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  // Use the documentElement's textContent property to get the visible text
  // textContent returns all the text contained within an element and its descendants
  return doc.documentElement.textContent || "";
}
