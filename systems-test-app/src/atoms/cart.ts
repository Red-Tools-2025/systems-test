// src/atoms/cart.ts
import { atom } from "jotai";
import type { Inventory } from "@/types/db";

export type CartItem = Inventory & { quantity: number };

export const cartAtom = atom<CartItem[]>([]);
