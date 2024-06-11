import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { Button } from "@/components/ui/button";
// import {Form as RemixForm} from "@remix-run/node";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LuX } from "react-icons/lu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Link } from "@remix-run/react";

export const TinyFormSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  username: z.string().min(2).max(50),
  domain: z.string(),
});


export type TinyFormType = z.infer<typeof TinyFormSchema>;

export function NewMailboxTinyForm({
  index,
  domains,
  setForms,
  forms,
}: {
  index: number;
  domains: string[];
  setForms: (forms: TinyFormType[]) => void;
  forms: TinyFormType[];
}) {
  const data = forms[index];
  const form = useForm<z.infer<typeof TinyFormSchema>>({
    resolver: zodResolver(TinyFormSchema),
  });
  function onSubmit(values: z.infer<typeof TinyFormSchema>) {
    console.log(values);
  }

  return (
    <div className="flex max-w-[52rem] flex-col bg-gray-50 p-5 *:mx-auto">
      <div className="mb-2 ml-0 flex w-[50rem] justify-between">
        <p className="text-xl font-bold">Mailbox #{index+1}</p>
        <Button
          variant={"ghost"}
          onClick={(e) => setForms(forms.filter((f, i) => i !== index))}
        >
          <LuX className="text-red-500" />
        </Button>
      </div>
      <div className="pt-2"></div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="flex min-w-[50rem] gap-3  *:w-full">
            <Input
              placeholder="First Name"
              onChange={(e) =>
                setForms(
                  forms.map((f, i) =>
                    i === index ? { ...f, firstName: e.target.value } : f,
                  ),
                )
              }
              value={data.firstName}
            />
            <Input
              placeholder="Last Name"
              onChange={(e) =>
                setForms(
                  forms.map((f, i) =>
                    i === index ? { ...f, lastName: e.target.value } : f,
                  ),
                )
              }
              value={data.lastName}
            />
          </div>
          <div className="flex min-w-[50rem] gap-3  *:w-full">
            <Input
              placeholder="Address"
              onChange={(e) =>
                setForms(
                  forms.map((f, i) =>
                    i === index ? { ...f, username: e.target.value } : f,
                  ),
                )
              }
              value={data.username}
            />
            <Select
              onValueChange={(e) => {
                setForms(
                  forms.map((f, i) => (i === index ? { ...f, domain: e } : f)),
                );
              }}
              value={data.domain}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {domains.map((domain, index) => (
                  <SelectItem key={index} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
      </Form>
    </div>
  );
}
