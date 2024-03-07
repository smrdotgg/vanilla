import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export type CsvToModelMapping = {
  name: string;
  email: string;
  companyName: string;
};

export function AcceptUserCSVConfig({
  headers,
  mapping,
  commitMapping,
}: {
  headers: string[];
  mapping: CsvToModelMapping;
  commitMapping: (inp: CsvToModelMapping) => unknown;
}) {
  return (
    <div className="flex flex-col gap-2">
      <SelectRow
        label="Name"
        value={mapping.name}
        choices={headers}
        onSelect={(n) => commitMapping({ ...mapping, name: n })}
      />
      <SelectRow
        label="Email"
        value={mapping.email}
        choices={headers}
        onSelect={(n) => commitMapping({ ...mapping, email: n })}
      />
      <SelectRow
        label="Company"
        value={mapping.companyName}
        choices={headers}
        onSelect={(n) => commitMapping({ ...mapping, companyName: n })}
        isOptional={true}
      />

      <div className="flex gap-2"></div>
    </div>
  );
}

function SelectRow({
  label,
  value,
  choices,
  onSelect,
  isOptional,
}: {
  label: string;
  value: string;
  choices: string[];
  onSelect: (c: string) => unknown;
  isOptional?: boolean;
}) {
  return (
    <div className="flex gap-2 *:my-auto">
      <div className="flex w-1/4 justify-end align-bottom *:ml-auto flex-col">
        <p>{label}</p>
        {isOptional ? <p className="text-gray-400">(Optional)</p> : <></>}
      </div>
      <Select value={value ?? undefined} onValueChange={onSelect}>
        <SelectTrigger className={`w-[180px]`}>
          <SelectValue placeholder="Select Column" />
        </SelectTrigger>
        <SelectContent>
          {choices.map((h, i) => (
            <SelectItem key={i} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(isOptional && value.length != 0) ? (
        <Button className="px-3" variant={"ghost"} onClick={() => onSelect("")}>
          X
        </Button>
      ) : (
        <></>
      )}
      <div className="flex-grow text-gray-600"></div>
    </div>
  );
}

