// src/atoms/auth.ts
import { atomWithStorage } from "jotai/utils";
import type { Employee } from "@/types/db";

export const employeeAtom = atomWithStorage<Employee | null>("employee", null);
