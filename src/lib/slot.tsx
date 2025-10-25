/**
 * Copyright (c) 2025 Sudharshan2026
 * Licensed under the MIT License
 */

import * as React from "react"

// Simple Slot implementation to replace @radix-ui/react-slot
export const Slot = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }
>(({ children, ...props }, ref) => {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...(children.props as any),
      ref,
    })
  }
  
  return <div ref={ref as React.Ref<HTMLDivElement>} {...props}>{children}</div>
})