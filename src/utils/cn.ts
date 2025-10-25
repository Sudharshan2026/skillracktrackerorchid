/**
 * Copyright (c) 2025 Sudharshan2026
 * Licensed under the MIT License
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
