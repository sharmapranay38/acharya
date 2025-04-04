"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    indeterminate?: boolean
  }
>(({ className, indeterminate, checked, ...props }, ref) => {
  const checkboxRef = React.useRef<HTMLButtonElement>(null)

  React.useImperativeHandle(ref, () => checkboxRef.current as HTMLButtonElement)

  React.useEffect(() => {
    if (checkboxRef.current && typeof indeterminate === "boolean") {
      checkboxRef.current.dataset.indeterminate = indeterminate.toString()
    }
  }, [indeterminate])

  return (
    <CheckboxPrimitive.Root
      ref={checkboxRef}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[indeterminate=true]:bg-primary data-[indeterminate=true]:text-primary-foreground",
        className,
      )}
      checked={checked}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
        {indeterminate ? <div className="h-1 w-2 bg-current" /> : <CheckIcon className="h-4 w-4" />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

