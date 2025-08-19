import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string
    onValueChange?: (value: string) => void
    defaultValue?: string
    children?: React.ReactNode
  }
>(({ children, value, onValueChange, defaultValue, ...props }, ref) => {
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || "")
  const actualValue = value !== undefined ? value : selectedValue

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setSelectedValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <SelectContext.Provider value={{ value: actualValue, onValueChange: handleValueChange, open, setOpen }}>
      <div ref={ref} {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  
  return (
    <button
      ref={ref}
      type="button"
      role="combobox"
      aria-expanded={context?.open}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => context?.setOpen(!context?.open)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    placeholder?: string
  }
>(({ placeholder, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  const selectedItem = React.useContext(SelectItemContext)
  
  return (
    <span ref={ref} {...props}>
      {context?.value ? selectedItem?.children || context.value : placeholder}
    </span>
  )
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  
  if (!context?.open) return null
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
        className
      )}
      {...props}
    >
      <div className="p-1">
        {children}
      </div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
  }
>(({ className, children, value, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  const isSelected = context?.value === value
  
  return (
    <SelectItemContext.Provider value={{ children }}>
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          isSelected && "bg-accent text-accent-foreground",
          className
        )}
        onClick={() => context?.onValueChange?.(value)}
        {...props}
      >
        {children}
      </div>
    </SelectItemContext.Provider>
  )
})
SelectItem.displayName = "SelectItem"

const SelectContext = React.createContext<{
  value: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

const SelectItemContext = React.createContext<{
  children: React.ReactNode
} | null>(null)

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }