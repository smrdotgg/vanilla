import React, { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useFetcher, useParams } from "@remix-run/react";
import { INTENTS } from "./types";

export const NewEditor = ({id,contentString} : {id:number,contentString: string|null}) => {
  const [prevContent, setPrevContent] = useState(contentString??"");
  const [content, setContent] = useState(contentString??"");
  const fetcher = useFetcher();
  const params = useParams();

  // Debounce effect for content state
  useEffect(() => {
    const handler = setTimeout(() => {
      // Asynchronous operation
      const performAsyncOperation = async () => {
        const fd = new FormData();
        fd.append("intent", INTENTS.updateEmailContent);
        fd.append("content", content);
        fd.append("id", String(id));
        fetcher.submit(fd, { method: "post" });
        // Your async operation here. For example, sending content to an API.
      };
      if (prevContent !== content) {
        setPrevContent(content);
        performAsyncOperation();
      }
    }, 1000); // Adjust the delay (ms) as needed

    // Cleanup function to cancel the timeout if the content changes again before the delay is over
    return () => clearTimeout(handler);
  }, [content, fetcher, params.id,id, prevContent]); // Effect depends on content state

  return (
    <>
      <div className="p-2 text-black">
        {/* THE height of this thing is set in the CSS, with a hardcoded CSS class name */}
        <CKEditor
          editor={ClassicEditor}
          data={content}
          onChange={(_, editor) => setContent(editor.getData())}
        />
      </div>
    </>
  );
};
