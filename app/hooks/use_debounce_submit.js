import { useSubmit } from "@remix-run/react";
import { useCallback, useEffect, useRef } from "react";

export function useDebounceSubmit() {
  let timeoutRef = useRef();
  useEffect(() => {
    // no initialize step required since timeoutRef defaults undefined
    let timeout = timeoutRef.current;
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [timeoutRef]);
  // Clone the original submit to avoid a recursive loop
  const originalSubmit = useSubmit();
  const submit = useCallback(
    (
      /**
       * Specifies the `<form>` to be submitted to the server, a specific
       * `<button>` or `<input type="submit">` to use to submit the form, or some
       * arbitrary data to submit.
       *
       * Note: When using a `<button>` its `name` and `value` will also be
       * included in the form data that is submitted.
       */
      target,
      /**
       * Options that override the `<form>`'s own attributes. Required when
       * submitting arbitrary data without a backing `<form>`. Additionally, you
       * can specify a `debounceTimeout` to delay the submission of the data.
       */
      options,
    ) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (!options?.debounceTimeout || options.debounceTimeout <= 0) {
        return originalSubmit(target, options);
      }
      timeoutRef.current = setTimeout(() => {
        originalSubmit(target, options);
      }, options.debounceTimeout);
    },
    [originalSubmit],
  );
  return submit;
}
