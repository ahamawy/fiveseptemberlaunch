import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
  }
>(({ className, children, defaultValue, value, onValueChange, ...props }, ref) => {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || "")
  const actualValue = value !== undefined ? value : selectedValue

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setSelectedValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <div ref={ref} className={cn("", className)} {...props}>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              value: actualValue,
              onValueChange: handleValueChange,
            })
          : child
      )}
    </div>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string
  }
>(({ className, value, ...props }, ref) => {
  const parent = React.useContext(TabsContext)
  const isSelected = parent?.value === value

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isSelected}
      data-state={isSelected ? "active" : "inactive"}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isSelected && "bg-background text-foreground shadow-sm",
        className
      )}
      onClick={() => parent?.onValueChange?.(value)}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
  }
>(({ className, value, ...props }, ref) => {
  const parent = React.useContext(TabsContext)
  const isSelected = parent?.value === value

  if (!isSelected) return null

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

const TabsContext = React.createContext<{
  value: string
  onValueChange?: (value: string) => void
} | null>(null)

const TabsProvider: React.FC<{
  children: React.ReactNode
  value: string
  onValueChange?: (value: string) => void
}> = ({ children, value, onValueChange }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      {children}
    </TabsContext.Provider>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }