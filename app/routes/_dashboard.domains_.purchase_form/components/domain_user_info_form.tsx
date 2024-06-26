import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "./countries";
import { ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// import { countries } from "./countries";
import { DomainPurchaseDetailsSelect } from "~/db/schema.server";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "~/components/ui/button";
import { CountrySelect } from "./country_select";
import { Separator } from "~/components/ui/separator";
import { phoneCountryCodes } from "./phone_codes";
import { INTENTS } from "../types";
import { useFetcher, useNavigation } from "@remix-run/react";

// const phoneNumberValidator = z.string().regex(/^\+[1-9]\d{1,14}$/);
const formSectionSchema = {
  FirstName: z.string().min(2).max(50),
  LastName: z.string().min(2).max(50),
  Address1: z.string().min(2).max(50),
  City: z.string().min(2).max(50),
  StateProvince: z.string().min(2).max(50),
  PostalCode: z.string().min(4).max(6),
  Country: z.string(),

  PhoneCountryCode: z.string(), //.regex(/^\+[0-9]\d{1,14}$/),
  PhoneNumber: z.string().min(2).max(20),

  EmailAddress: z.string().email(),
};

export const domainUserInfoZodSchema = z.object({
  registrantFirstName: formSectionSchema.FirstName,
  registrantLastName: formSectionSchema.LastName,
  registrantAddress1: formSectionSchema.Address1,
  registrantCity: formSectionSchema.City,
  registrantStateProvince: formSectionSchema.StateProvince,
  registrantPostalCode: formSectionSchema.PostalCode,
  registrantCountry: formSectionSchema.Country,

  registrantPhoneCountryCode: formSectionSchema.PhoneCountryCode,
  registrantPhoneNumber: formSectionSchema.PhoneNumber,

  registrantEmailAddress: formSectionSchema.EmailAddress,
});

type NullableStringProps = {
  [key: string]: string | null;
};

function replaceNulls(obj: NullableStringProps) {
  const result: { [key: string]: string } = {};
  Object.keys(obj).forEach((key) => {
    result[key] = obj[key] === null ? "" : obj[key]!;
  });
  return result;
}

export function DomainUserInfoForm({
  initialData,
}: {
  initialData?: z.infer<typeof domainUserInfoZodSchema> | undefined;
}) {
  const form = useForm<z.infer<typeof domainUserInfoZodSchema>>({
    resolver: zodResolver(domainUserInfoZodSchema),
    defaultValues: initialData ? initialData : {},
  });
  const { submit } = useFetcher();
  const { state } = useNavigation();
  function onSubmit(values: z.infer<typeof domainUserInfoZodSchema>) {
    submit(
      { ...values, intent: INTENTS.UPDATE_DOMAIN_PURCHASE_INFO },
      { method: "post", encType: "application/json" },
    );
  }
  const formItemClass = "min-h-32 ";
  if (state !== "idle") return <>loading</>;

  return (
    <>
      {/* {JSON.stringify(initialData)} */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className=" mx-auto  flex w-full max-w-[80rem] flex-col gap-2 px-6"
        >
          <div className="flex flex-col gap-y-2 ">
            <div className="pt-4"></div>
            <div>
              <h3 className="text-lg font-medium">Registrant Info</h3>
              <p className="text-sm text-muted-foreground">
                This is how others will see you on the site.
              </p>
            </div>
            <FormField
              control={form.control}
              name="registrantFirstName"
              render={({ field }) => (
                <FormItem className={formItemClass}>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registrantLastName"
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
              name="registrantEmailAddress"
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
              name="registrantAddress1"
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
              name="registrantStateProvince"
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
            <FormField
              control={form.control}
              name="registrantCity"
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
              name="registrantCountry"
              render={({ field }) => (
                <FormItem className={formItemClass}>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <CountrySelect
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registrantPostalCode"
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

            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="registrantPhoneCountryCode"
                render={({ field }) => (
                  <FormItem className={formItemClass}>
                    <FormLabel>Country Code</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} name={field.name}>
                        <SelectTrigger className="w-[280px]">
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
                name="registrantPhoneNumber"
                render={({ field }) => (
                  <FormItem className={formItemClass}>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input className="w-60" placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="pt-4"></div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" variant="secondary">
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
          <div className="pt-4"></div>
        </form>
      </Form>
    </>
  );
}
