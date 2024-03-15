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
  fromName: string;
  fromEmail: string;
  userName: string;
  password: string;
  smtpHost: string;
  smtpPort: string;
  imapHost: string;
  imapPort: string;
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
        value={mapping.fromName}
        choices={headers}
        onSelect={(n) => commitMapping({ ...mapping, fromName: n })}
      />
      <SelectRow
        label="Email"
        value={mapping.fromEmail}
        choices={headers}
        onSelect={(n) => commitMapping({ ...mapping, fromEmail: n })}
      />
      <SelectRow
        label="Username"
        value={mapping.userName}
        choices={headers}
        onSelect={(n) => commitMapping({ ...mapping, userName: n })}
      />
      <SelectRow
        label="Password"
        value={mapping.password}
        choices={headers}
        onSelect={(n) => commitMapping({ ...mapping, password: n })}
      />
      <SelectRow
        label="SMTP Host"
        value={mapping.smtpHost}
        choices={headers}
        onSelect={(n) => commitMapping({ ...mapping, smtpHost: n })}
      />
      <SelectRow
        label="SMTP Port"
        value={mapping.smtpPort}
        choices={headers}
        onSelect={(n) => commitMapping({ ...mapping, smtpPort: n })}
      />
      <SelectRow
        label="IMAP Host"
        value={mapping.imapHost}
        choices={headers}
        onSelect={(n) => commitMapping({ ...mapping, imapHost: n })}
      />
      <SelectRow
        label="Imap Port"
        value={mapping.imapPort}
        choices={headers}
        onSelect={(n) => commitMapping({ ...mapping, imapPort: n })}
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
      <div className="flex w-1/3 flex-col justify-end px-2 align-bottom *:ml-auto">
        <p className="text-right">{label}</p>
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

      {isOptional && value.length != 0 ? (
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
