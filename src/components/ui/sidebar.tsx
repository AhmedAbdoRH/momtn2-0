
import * as React from "react"
import { cva } from "class-variance-authority"
import { X } from "lucide-react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"

// Sidebar context
// ------------------------------

interface SidebarContextType {
  open: boolean;
  mobile: boolean;
  setOpen: (open: boolean) => void;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextType | null>(null)

function useSidebarContext() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarContext")
  }
  return context
}

// Sidebar provider
// ------------------------------

interface SidebarProviderProps {
  defaultOpen?: boolean
  children: React.ReactNode
}

function SidebarProvider({
  defaultOpen = false,
  children,
}: SidebarProviderProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [mobile, setMobile] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const mobileBreakpoint = 768

  // Check if the screen is mobile
  React.useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setMobile(window.innerWidth < mobileBreakpoint)
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [mobileBreakpoint])

  // Close sidebar when click outside
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (mobile && mobileOpen && ref.current && !ref.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [mobile, mobileOpen, ref])

  const providerValue = React.useMemo(
    () => ({
      open,
      mobile,
      setOpen,
      setMobileOpen,
    }),
    [open, mobile]
  )

  return (
    <SidebarContext.Provider value={providerValue}>
      <div ref={ref}>{children}</div>
    </SidebarContext.Provider>
  )
}

// Sidebar
// ------------------------------

const sidebarVariants = cva(
  "h-screen fixed inset-y-0 z-20 flex flex-col",
  {
    variants: {
      side: {
        left: "left-0",
        right: "right-0",
      },
    },
    defaultVariants: {
      side: "left",
    },
  }
)

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    React.RefAttributes<HTMLDivElement> {
  side?: "left" | "right"
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, side = "left", ...props }, ref) => {
    const { open, mobile } = useSidebarContext()

    if (mobile) {
      return null
    }

    return (
      <aside
        ref={ref}
        data-sidebar={open ? "expanded" : "collapsed"}
        className={cn(
          sidebarVariants({ side }),
          open ? "w-64" : "w-14",
          "bg-sidebar border-r border-border shadow-sm transition-all ease-in-out duration-300",
          className
        )}
        {...props}
      />
    )
  }
)

Sidebar.displayName = "Sidebar"

// Sidebar content
// ------------------------------

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { open } = useSidebarContext()

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col flex-1 py-4 overflow-y-auto overflow-x-hidden",
        className
      )}
      {...props}
    />
  )
})

SidebarContent.displayName = "SidebarContent"

// Sidebar for mobile
// ------------------------------

const SidebarMobile = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    side?: "left" | "right"
  }
>(({ className, side = "left", ...props }, ref) => {
  const { mobile, setMobileOpen } = useSidebarContext()
  const { mobileOpen } = useSidebarContext() as { mobileOpen?: boolean }

  if (!mobile) {
    return null
  }

  return (
    <Sheet open={!!mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side={side} className={cn("w-64", className)}>
        <div ref={ref} {...props} />
      </SheetContent>
    </Sheet>
  )
})

SidebarMobile.displayName = "SidebarMobile"

// Sidebar header
// ------------------------------

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { open } = useSidebarContext()

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-12 items-center px-4 mb-2",
        open ? "justify-between" : "justify-center",
        className
      )}
      {...props}
    />
  )
})

SidebarHeader.displayName = "SidebarHeader"

// Sidebar footer
// ------------------------------

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { open } = useSidebarContext()

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-12 items-center px-4 mt-2",
        open ? "justify-between" : "justify-center",
        className
      )}
      {...props}
    />
  )
})

SidebarFooter.displayName = "SidebarFooter"

// Sidebar group
// ------------------------------

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("py-2 px-2", className)} {...props} />
  )
})

SidebarGroup.displayName = "SidebarGroup"

// Sidebar group label
// ------------------------------

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { open } = useSidebarContext()

  if (!open) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "px-2 mb-2 text-xs text-muted-foreground font-medium",
        className
      )}
      {...props}
    />
  )
})

SidebarGroupLabel.displayName = "SidebarGroupLabel"

// Sidebar group content
// ------------------------------

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-1", className)} {...props} />
})

SidebarGroupContent.displayName = "SidebarGroupContent"

// Sidebar menu
// ------------------------------

const SidebarMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("", className)} {...props} />
})

SidebarMenu.displayName = "SidebarMenu"

// Sidebar menu item
// ------------------------------

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => {
  return (
    <li ref={ref} className={cn("list-none", className)} {...props} />
  )
})

SidebarMenuItem.displayName = "SidebarMenuItem"

// Sidebar menu button
// ------------------------------

const menuButtonVariants = cva(
  "group flex items-center justify-start w-full gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "hover:bg-accent hover:text-accent-foreground",
        active: "bg-accent text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "active"
  asChild?: boolean
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, variant, asChild = false, ...props }, ref) => {
  const { open } = useSidebarContext();
  
  if (asChild) {
    const child = React.Children.only(props.children) as React.ReactElement;
    
    if (!React.isValidElement(child)) {
      return null;
    }
    
    return React.cloneElement(child, {
      ref,
      className: cn(menuButtonVariants({ variant }), child.props.className, className),
      children: (
        <>
          {React.Children.map(child.props.children, (grandChild) => {
            if (React.isValidElement(grandChild) && grandChild.type === "span" && !open) {
              return null;
            }
            return grandChild;
          })}
        </>
      ),
    });
  }
  
  return (
    <button
      ref={ref}
      className={cn(menuButtonVariants({ variant }), className)}
      {...props}
    />
  );
});

SidebarMenuButton.displayName = "SidebarMenuButton"

// Sidebar trigger
// ------------------------------

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { open, setOpen, mobile, setMobileOpen } = useSidebarContext()

  const handleClick = () => {
    if (mobile) {
      setMobileOpen(true)
    } else {
      setOpen(!open)
    }
  }

  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      className={cn(
        "h-8 w-8",
        mobile ? "fixed top-4 left-4 z-10" : "",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <X className={cn("h-4 w-4 rotate-90", mobile ? "" : !open ? "rotate-0" : "rotate-90" )} />
    </Button>
  )
})

SidebarTrigger.displayName = "SidebarTrigger"

export {
  // Context
  SidebarProvider,
  // Components
  Sidebar,
  SidebarMobile,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  // Types
  type SidebarMenuButtonProps,
}
