import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { useFetcher } from "@remix-run/react";
import { INTENTS } from "../types";
import { Input } from "~/components/ui/input";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { LuLoader } from "react-icons/lu";
import { objToFormData } from "~/utils/forms";
import { toast } from "sonner";
import { action } from "../route";

export function RowMenu({
  domain,
  trigger,
  asChild = true,
}: {
  domain: string;
  trigger: ReactNode;
  asChild?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild={asChild}>{trigger}</PopoverTrigger>
      <PopoverContent className="w-48 p-2 flex flex-col gap-2">
        <p>
          Row Actions - <span className="font-mono">{domain}</span>{" "}
        </p>
        <SendTestEmailModal
          domain={domain}
          className="w-full"
          closePopup={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

function SendTestEmailModal({
  domain,
  asChild = true,
  className,
  closePopup,
}: {
  domain: string;
  asChild?: boolean;
  className?: string;
  closePopup: () => void;
}) {
  const fetcher = useFetcher<typeof action>();
  const [open, setOpen] = useState(false);

  const formSchema = INTENTS.sendTestEmail.schema;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: domain,
      intent: "sendTestEmail",
    },
  });
  const onSubmit = (payload: z.infer<typeof formSchema>) => {
    fetcher.submit(objToFormData(payload), {
      method: "post",
    });
  };

  const isLoading =
    fetcher.state === "loading" || fetcher.state === "submitting";
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      toast("Test email sent!", {
        description: "Check your email.",
        duration: 10_000,
      });
      setOpen(false);
      closePopup();
    }
  }, [fetcher]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={asChild}>
        <Button variant="secondary" className={className}>
          Send test email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
          <DialogDescription>
            Send test email from <span className="font-mono">{domain}</span> to
            test if its working.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    A test email will be sent to your address shortly.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              {!!fetcher.data?.error && (
                <p className="text-red-500">{fetcher.data.error}</p>
              )}
              <Button type="submit" disabled={isLoading}>
                <LuLoader
                  className={`animate-spin ${isLoading ? "" : "hidden"}`}
                  aria-hidden={!isLoading}
                />
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
