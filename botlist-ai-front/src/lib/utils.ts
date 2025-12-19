import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Derive a favicon URL from a website URL using Google's s2 service with fallback
export function getFaviconUrl(websiteUrl: string | undefined | null, size: 32 | 64 | 16 = 32): string {
  try {
    if (!websiteUrl) return `https://www.google.com/s2/favicons?sz=${size}&domain=example.com`
    const url = new URL(websiteUrl)
    const domain = url.hostname
    return `https://www.google.com/s2/favicons?sz=${size}&domain=${domain}`
  } catch {
    return `https://www.google.com/s2/favicons?sz=${size}&domain=example.com`
  }
}
