import { atom } from "jotai";
import { CartItem } from "./types";

export const cartAtom = atom<CartItem[]>([
  {
    price: 10,
    name: "example.com",
    id: String(0),
    isAvailable: true,
  },
]);
