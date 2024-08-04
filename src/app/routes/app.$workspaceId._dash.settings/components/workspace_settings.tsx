import { Link } from "@remix-run/react";
import { Moon, Sun } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Theme, useTheme } from "remix-themes";
import { BACKUP_THEME } from "~/app/client_random/constants";

export const WorkspaceSettings = () => {
  return (
    <div className="flex flex-col  mx-auto max-w-[700px] w-full">
      <div className="pt-10"></div>
      <ThemeSettingsBlock />
    </div>
  );
};

const ThemeSettingsBlock = () => {
  return (
    <div className="border border-secondary p-6 rounded-2xl">
      <div className="flex justify-between">
        <p>Appearance</p>
        <SelectDemo />
      </div>
    </div>
  );
};

export function SelectDemo() {
  const [theme, setTheme] = useTheme();
  return (
    <Select
      value={theme ?? BACKUP_THEME}
      onValueChange={(value) => setTheme(value as Theme)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Theme</SelectLabel>
          <SelectItem value={Theme.LIGHT}>Light</SelectItem>
          <SelectItem value={Theme.DARK}>Dark</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
