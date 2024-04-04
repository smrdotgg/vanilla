import React, { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useFetcher, useParams } from "@remix-run/react";
import { INTENTS } from "./types";
import { Checkbox } from "~/components/ui/checkbox";
import { Textarea } from "~/components/ui/textarea";
import { extractVisibleTextFromHTML } from "./components/step_tile";
import { api } from "~/server/trpc/react";
import { decodeHtml, encodeHtml } from "~/lib/html_encoding";

export const NewEditor = ({
  id,
  contentString,
  isPlainText,
}: {
  id: number;
  contentString: string | null;
  isPlainText: boolean;
}) => {
  const [prevContent, setPrevContent] = useState(
    isPlainText ? decodeHtml(contentString?.replace(/<br\s*\/?>/gi, "\n") ?? "") : (contentString ?? ""),
  );
  const [content, setContent] = useState(
    isPlainText ? decodeHtml(contentString?.replace(/<br\s*\/?>/gi, "\n") ?? "") : (contentString ?? ""),
  );
  const params = useParams();
  const [plainTextMode, setPlainTextMode] = useState(isPlainText);
  const updateContentMutation = api.sequence.updateContent.useMutation();

  useEffect(() => {
    if (plainTextMode) {
      setContent((content) => extractVisibleTextFromHTML(content));
    }
  }, [plainTextMode]);

  useEffect(() => {
    const parsedContent = plainTextMode ? encodeHtml(content).replace(/\n/g, "<br>") : content;
    const handler = setTimeout(() => {
      const performAsyncOperation = async () => {
        updateContentMutation.mutate({
          id,
          content: parsedContent,
          type: plainTextMode ? "plain" : "html",
        });
      };
      if (prevContent !== content) {
        setPrevContent(content);
        performAsyncOperation();
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [content, plainTextMode, params.id, id, prevContent]); // Effect depends on content state

  return (
    <div>
      <div className="p-2 ">
        <div className="flex gap-2 *:my-auto">
          <Checkbox
            onCheckedChange={() => setPlainTextMode(!plainTextMode)}
            checked={plainTextMode}
          />
          <p>Plain Text Mode</p>
        </div>
        {plainTextMode && (
          <Textarea
            className="h-96 rounded-none bg-white text-black"
            placeholder="Your Email..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        )}
        {!plainTextMode && (
          <div className="text-black">
            <CKEditor
              editor={ClassicEditor}
              data={content}
              onChange={(_, editor) => {
                setContent(editor.getData());
              }}
            />
          </div>
        )}
      </div>
      {/* Floating checkbox */}
    </div>
  );
};
