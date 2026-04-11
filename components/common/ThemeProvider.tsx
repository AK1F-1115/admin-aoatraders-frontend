'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from 'react'

/**
 * Thin wrapper around next-themes ThemeProvider.
 * Must be a Client Component — lives in the root layout to wrap the whole app.
 * Uses `attribute="class"` to drive the `.dark` class on <html>, which is what
 * globals.css `@custom-variant dark (&:is(.dark *))` expects.
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
