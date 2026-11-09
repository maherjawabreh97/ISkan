import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind classes with the usual conflict rules.
 *
 * Conditional styling in this codebase keeps producing pairs like
 * `p-3 p-4`, where which one wins depends on source order inside the compiled
 * stylesheet rather than the order they were written. `twMerge` makes the last
 * class win, which is what every caller already assumes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
