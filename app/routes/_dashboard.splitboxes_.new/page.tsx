import {
  Form as RemixForm,
  Link,
  useLoaderData,
  useNavigation,
  useFetcher,
} from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formSchema, INTENTS } from "./types";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loader } from "./route";

export const Page = () => {
  const {  previouslyCreatedSplitboxes } = useLoaderData<typeof loader>();
  const { state } = useNavigation();
  const { submit } = useFetcher();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: `SplitBox ${previouslyCreatedSplitboxes + 1}`,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // console.log(values);
    const data = { intent: INTENTS.CREATE_SPLITBOX, name: values.name };
    submit(data, { method: "post", encType: "application/json" });
  }

  return (
    <div className="flex h-full w-full *:m-auto">
      <div className="flex flex-col rounded bg-primary-foreground px-6 py-8">
        <p className="text-3xl">
          Are you sure you want to create a new splitbox?
        </p>
        <div className="pt-4"></div>
        <Form {...form}>
          <RemixForm
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique name for your SplitBox.
                    <br />
                    A SplitBox is a unique Box you can use to host your email
                    servers.
                    <br />
                    Each SplitBox has its own unique IP address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div></div>
            <div className="flex justify-end gap-2">
              <Button asChild variant="secondary" onClick={() => {}}>
                <Link to="/splitboxes">
                  {state === "idle" ? "Cancel" : "Loading..."}
                </Link>
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </RemixForm>
        </Form>
      </div>
    </div>
  );
};
