import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Theme, useTheme } from "remix-themes";

export function ModeToggle() {

  const [,setTheme] = useTheme();

  return (
  <div className="pb-3 pl-3">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="" size="icon">
          <Sun className="h-[1.2rem]  text-black dark:text-white  w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute text-black dark:text-white h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="ml-3" align="end">
        <DropdownMenuItem onClick={() => setTheme(Theme.LIGHT)}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme(Theme.DARK)}>
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
  );
}
