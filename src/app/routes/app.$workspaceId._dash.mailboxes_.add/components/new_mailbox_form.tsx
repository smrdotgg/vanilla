import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z, ZodError } from "zod";
import { Input } from "~/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LuX } from "react-icons/lu";
import { Form, FormControl, FormLabel } from "@/components/ui/form";

export const TinyFormSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().nullish(),//.min(2).max(50).nullish(),
  username: z.string().min(2).max(50),
  domain: z.string().min(1),
});

export type TinyFormType = z.infer<typeof TinyFormSchema>;

export function NewMailboxTinyForm({
  index,
  domains,
  setForms,
  forms,
  error,
}: {
  index: number;
  domains: string[];
  setForms: (forms: TinyFormType[]) => void;
  forms: TinyFormType[];
  error: ZodError<TinyFormType> | undefined;
}) {
  const data = forms[index];
  const form = useForm<z.infer<typeof TinyFormSchema>>({
    resolver: zodResolver(TinyFormSchema),
  });
  function onSubmit(values: z.infer<typeof TinyFormSchema>) {
    console.log(values);
  }

  return (
    <div className="flex max-w-[52rem] flex-col dark:border-white dark:bg-gray-950 bg-gray-50 p-5 *:mx-auto">
      <div className="mb-2 ml-0 flex w-[50rem] justify-between">
        <p className="text-xl font-bold">Mailbox #{index + 1}</p>
        {forms.length > 1 && <Button
          variant={"ghost"}
          onClick={() => setForms(forms.filter((f, i) => i !== index))}
        >
          <LuX className="text-red-500" />
        </Button>}
      </div>
      <div className="pt-2"></div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="flex min-w-[50rem] gap-3  *:w-full">
            <div>
              <FormLabel>* First Name</FormLabel>
              <Input
                placeholder="First Name"
                onChange={(e) =>
                  setForms(
                    forms.map((f, i) =>
                      i === index ? { ...f, firstName: e.target.value } : f
                    )
                  )
                }
                value={data.firstName}
              />
              <ErrorDisplay errors={error?.formErrors.fieldErrors.firstName} />
            </div>

            <div>
              <FormLabel>Last Name</FormLabel>
              <Input
                placeholder="Last Name"
                onChange={(e) =>
                  setForms(
                    forms.map((f, i) =>
                      i === index ? { ...f, lastName: e.target.value } : f
                    )
                  )
                }
                value={data.lastName ?? ""}
              />
              <ErrorDisplay errors={error?.formErrors.fieldErrors.lastName} />
            </div>
          </div>
          <div className="flex min-w-[50rem] gap-3  *:w-full">
            <div>
              <FormLabel>* Address</FormLabel>
              <Input
                placeholder="Address"
                onChange={(e) =>
                  setForms(
                    forms.map((f, i) =>
                      i === index ? { ...f, username: e.target.value } : f
                    )
                  )
                }
                value={data.username}
              />
              <ErrorDisplay errors={error?.formErrors.fieldErrors.username} />
            </div>
            <div>
              <FormLabel>* Domain</FormLabel>
              <Select
                onValueChange={(e) => {
                  setForms(
                    forms.map((f, i) => (i === index ? { ...f, domain: e } : f))
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
              <ErrorDisplay errors={error?.formErrors.fieldErrors.domain} />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
function ErrorDisplay({ errors }: { errors: string[] | undefined }) {
  const parsedError =
    errors !== undefined && errors.length > 0 ? errors![0] : undefined; // Boolean(errors?.length) ? errors![0] : "";

  return <>
    <p className="text-red-500 text-xs ">{parsedError ?? <>&nbsp;</>}</p>
  </>;
}
