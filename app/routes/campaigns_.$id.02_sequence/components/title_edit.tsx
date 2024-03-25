import { useFetcher } from "@remix-run/react";
import { useState, useRef } from "react";
import { Input } from "~/components/ui/input";
import { INTENTS } from "../types";
import { flushSync } from "react-dom";
export const NameView = ({
  value,
  id,
}: {
  id: number;
  value: string | undefined;
}) => {
  const fetcher = useFetcher();
  const [editMode, setEditMode] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (fetcher.formData?.has("title")) {
    value = String(fetcher.formData?.get("title"));
  }

  if (editMode) {
    return (
      <fetcher.Form
        method="post"
        onSubmit={(event) => {
          event.preventDefault();
          flushSync(() => {
            event.currentTarget.submit();
            setEditMode(false);
          });
          buttonRef.current?.focus();
        }}
      >
        <div className="w-60">
          <Input
            name="title"
            required
            defaultValue={value}
            ref={inputRef}
            onBlur={(event) => {
              if (inputRef.current?.value != value) {
                fetcher.submit(event.currentTarget.form);
              }
              setEditMode(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                flushSync(() => {
                  setEditMode(false);
                });
                buttonRef?.current?.focus();
              }
              if (event.key === "Enter") {
                if (inputRef.current?.value != value) {
                  flushSync(() => {
                    fetcher.submit(event.currentTarget.form);
                  });
                  setEditMode(false);
                  buttonRef.current?.focus();
                }
              }
            }}
            type="text"
            className="h-9 p-0 text-3xl font-bold"
          />
          <input name="intent" hidden={true} value={INTENTS.updateEmailTitle} />
          <input name="id" hidden={true} value={String(id)} />
        </div>
      </fetcher.Form>
    );
  }

  return (
    <button
      ref={buttonRef}
      onClick={() => {
        flushSync(() => {
          setEditMode(true);
        });
        inputRef.current?.focus();
      }}
      className={`flex h-9 w-60 pb-1  pl-[0.05rem] text-3xl font-bold ${value ? "" : "text-secondary"}`}
    >
      <p>{value || "Set Value"}</p>
    </button>
  );
};
