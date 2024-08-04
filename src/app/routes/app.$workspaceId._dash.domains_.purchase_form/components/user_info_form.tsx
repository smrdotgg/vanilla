import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { phoneCountryCodes } from "./phone_codes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "~/components/ui/button";
import { INTENTS } from "../types";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { countries } from "./countries";
import { loader } from "../route";

export const schemaSettings = {
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50),
  address: z.string().min(2).max(50),
  city: z.string().min(2).max(50),
  state_province: z.string().min(2).max(50),
  postal_code: z.string().min(4).max(6),
  country: z.string(),
  email_address: z.string().email(),
  phone_code: z.string(), //.regex(/^\+[0-9]\d{1,14}$/),
  phone_number: z.string().min(2).max(20),
};

export const domainUserInfoZodSchema = z.object(schemaSettings);

export function DomainUserInfoForm({
  initialData,
}: {
  initialData?: z.infer<typeof domainUserInfoZodSchema> | undefined;
}) {
  const { workspaceId } = useLoaderData<typeof loader>();
  const { state, submit } = useFetcher();
  const loading = state !== "idle";
  const form = useForm<z.infer<typeof domainUserInfoZodSchema>>({
    resolver: zodResolver(domainUserInfoZodSchema),
    defaultValues: initialData ? initialData : {},
    disabled: loading,
  });

  function onSubmit(values: z.infer<typeof domainUserInfoZodSchema>) {
    submit(
      { ...values, intent: INTENTS.UPDATE_DOMAIN_PURCHASE_INFO },
      { method: "post", encType: "application/json" }
    );
  }
  const formItemClass = " ";

  return (
    <>
      {/* {JSON.stringify(initialData)} */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className=" mx-auto  flex w-full max-w-[80rem] flex-col gap-2 px-6"
        >
          <div className="pt-4"></div>
          <div>
            <h3 className="text-lg font-medium">Domain Owner Information</h3>
            {/* <p className="text-sm text-muted-foreground"> */}
            {/*   This is how others will see you on the site. */}
            {/* </p> */}
          </div>
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem className={formItemClass}>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input disabled={loading} placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem className={formItemClass}>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email_address"
            render={({ field }) => (
              <FormItem className={formItemClass}>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <>
                <FormItem className={formItemClass}>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </>
            )}
          />
          <FormField
            control={form.control}
            name="state_province"
            render={({ field }) => (
              <FormItem className={formItemClass}>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2 *:w-full">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className={formItemClass}>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className={"w-full"}>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Select {...field} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(countries).map(([k, value], index) => (
                          <SelectItem key={index} value={value}>
                            {k}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem className={formItemClass}>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 *:w-full">
            <FormField
              control={form.control}
              name="phone_code"
              render={({ field }) => (
                <FormItem className={formItemClass}>
                  <FormLabel>Country Code</FormLabel>
                  <FormControl>
                    <Select {...field} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Country Code" />
                      </SelectTrigger>
                      <SelectContent>
                        {phoneCountryCodes.countries.map((data, index) => (
                          <SelectItem value={data.code} key={index}>
                            {data.name} ({data.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem className={formItemClass}>
                  <FormLabel>Phone Number (Excluding Country Code)</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="pt-4"></div>

          <div className="flex justify-end gap-2">
            {!loading && (
              <Button asChild variant={"secondary"}>
                <Link to={`/app/${workspaceId}/domains`}>Cancel</Link>
              </Button>
            )}
            {/* <Button onClick={() => navigate("")} variant="secondary"> */}
            {/*   Cancel */}
            {/* </Button> */}
            <Button disabled={loading} type="submit">
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
          <div className="pt-4"></div>
        </form>
      </Form>
    </>
  );
}
