import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function isMobile() {
  return window.matchMedia("(max-width: 640px)").matches
}

export function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function truncateText(text: string, length: number) {
  if (text.length <= length) return text
  return `${text.slice(0, length)}...`
}

export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
