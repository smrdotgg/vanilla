import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LuTv } from "react-icons/lu";

export function AccountTile() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className=" rounded m-1 bg-gray-900 text-white transition duration-100 hover:bg-gray-900 p-0 flex  items-center px-3 justify-start"
        >
          <LuTv className="h-8 min-w-4" size={16} />
          <div className="pl-2"></div>
          <p>Account</p>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex flex-col">
          <Button asChild>
            <a href='/auth/sign-out'>
              Logout
            </a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
