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
import React from "react";
import { SelectProps } from "@radix-ui/react-select";
import { InputProps } from "~/components/ui/input";
// React.forwardRef<HTMLInputElement, InputProps>(
//   ({ className, type, ...props }, ref)
//
//
// const Input = React.forwardRef<HTMLInputElement, InputProps>(
//   ({ className, type, ...props }, ref) => {
//     return (
//
//
//
//

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return <input type={type} className={className} ref={ref} {...props} />;
  },
);

export const CountrySelect = ({
  onValueChange,
  name,
  defaultValue,
}: {
  defaultValue: string;
  onValueChange: (val: string) => void;
  name: string;
}) => {
  return (
    <Select onValueChange={onValueChange} name={name}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(countries).map(([k, value]) => (
          <SelectItem value={value}>{k}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// export const CountrySelect  = React.forwardRef<HTMLInputElement, SelectProps>
//   ({ className, type, ...props }, ref) => {
//   return (
//     <Select {...args}>
//       <SelectTrigger className="w-[280px]">
//         <SelectValue placeholder="Select a country" />
//       </SelectTrigger>
//       <SelectContent>
//         {Object.entries(countries).map(([k, value]) => (
//           <SelectItem value={value}>{k}</SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   );
// }
