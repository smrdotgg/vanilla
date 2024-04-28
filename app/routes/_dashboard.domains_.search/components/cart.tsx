import { Button } from "~/components/ui/button";
import { CartItem } from "../types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ImCross } from "react-icons/im";
import { TiTick } from "react-icons/ti";
import { FaRegTrashAlt } from "react-icons/fa";

export function Cart({
  cartState,
  updateCartState,
}: {
  cartState: CartItem[];
  updateCartState: (newState: CartItem[]) => void;
}) {
  const label = `${cartState.length} ${cartState.length == 1 ? "Item" : "Items"}`;
  const total = cartState.length
    ? cartState.map((i) => i.price).reduce((prev, current) => prev + current)
    : 0;
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={"secondary"}>Cart ({label})</Button>
        </PopoverTrigger>
        <PopoverContent className="mr-1 w-96">
          <div className="">
            <div className="flex justify-between">
              <p>{label}</p>
              <p>Total - ${total}</p>
            </div>
            <div className="pt-2"></div>
            <div className="flex max-h-96 flex-col overflow-y-auto">
              {cartState.map((cartItem, index) => (
                <div
                  index={index}
                  className="flex justify-between rounded bg-primary-foreground px-3 py-1 *:my-auto"
                >
                  <div className="flex gap-2 *:my-auto">
                    <Button
                      variant={"outline"}
                      className="px-2"
                      onClick={() =>
                        updateCartState(
                          cartState.filter((item) => item.id !== cartItem.id),
                        )
                      }
                    >
                      <FaRegTrashAlt className="text-red-500" />
                    </Button>
                    <div className="flex flex-col">
                      <p>{cartItem.name}</p>
                      <p>${cartItem.price}</p>
                    </div>
                  </div>
                  <div className="">
                    <p>{cartItem.isAvailable}</p>
                    {cartItem.isAvailable ? (
                      <TiTick className="text-green-500" />
                    ) : (
                      <ImCross className="text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
