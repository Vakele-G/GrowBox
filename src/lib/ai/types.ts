import type { ParsedEntry, Product } from "@/lib/domain/types";

export interface ParseContext {
  products?: Product[];
  currentDate?: string;
}

export type { ParsedEntry };
