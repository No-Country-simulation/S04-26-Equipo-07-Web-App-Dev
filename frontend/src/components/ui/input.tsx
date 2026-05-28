import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

interface InputProps extends Omit<React.ComponentProps<"input">, "icon"> {
  icon?: React.ReactNode
  onIconClick?: () => void
}

function Input({ className, type, icon, onIconClick, ...props }: InputProps) {
  return (
    <div className="relative">
      <InputPrimitive
        type={type}
        data-slot="input"
        className={cn(
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          icon && "pr-8",
          className
        )}
        {...props}
      />
      {icon && (
        <button
          type="button"
          onClick={onIconClick}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
          aria-label={onIconClick ? "Toggle password visibility" : undefined}
        >
          {icon}
        </button>
      )}
    </div>
  )
}

export { Input }
