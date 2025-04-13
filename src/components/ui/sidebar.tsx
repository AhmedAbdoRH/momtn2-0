import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

// Import hooks and utilities - Assuming these exist in your project structure
// Replace with actual paths if different
// import { useIsMobile } from "@/hooks/use-mobile" // Assuming this hook exists
// import { cn } from "@/lib/utils" // Assuming this utility exists
// import { Button } from "@/components/ui/button" // Assuming this component exists
// import { Input } from "@/components/ui/input" // Assuming this component exists
// import { Separator } from "@/components/ui/separator" // Assuming this component exists
// import { Sheet, SheetContent } from "@/components/ui/sheet" // Assuming these components exist
// import { Skeleton } from "@/components/ui/skeleton" // Assuming this component exists
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip" // Assuming these components exist

// --- Mock implementations for missing imports (Remove if you have the actual imports) ---
const useIsMobile = () => {
  // Basic check, replace with your actual hook logic
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
};

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn("button-base", variant, size, className)} {...props} />
  )
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn("input-base", className)} {...props} />
  )
);
Input.displayName = "Input";

const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("separator-base", className)} {...props} />
  )
);
Separator.displayName = "Separator";

const Sheet = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
  <div data-state={open ? 'open' : 'closed'} className="sheet-base">
    {/* Simplified Sheet logic */}
    {open && children}
  </div>
);

const SheetContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { side?: string }>(
  ({ className, side, children, ...props }, ref) => (
    <div ref={ref} className={cn("sheet-content-base", `side-${side}`, className)} {...props}>
      {children}
      <button onClick={() => (props as any).onOpenChange?.(false)} className="sheet-close-button">X</button>
    </div>
  )
);
SheetContent.displayName = "SheetContent";

const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("skeleton-base", className)} {...props} />
  )
);
Skeleton.displayName = "Skeleton";

const TooltipProvider = ({ children, delayDuration }: { children: React.ReactNode; delayDuration?: number }) => (
  <div>{children}</div> // Simplified TooltipProvider
);

const Tooltip = ({ children }: { children: React.ReactNode }) => (
  <div className="tooltip-base">{children}</div> // Simplified Tooltip
);

const TooltipTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  if (asChild) return <>{children}</>;
  return <button className="tooltip-trigger-base">{children}</button>; // Simplified TooltipTrigger
};

const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { side?: string; align?: string; hidden?: boolean }>(
  ({ className, side, align, hidden, children, ...props }, ref) => (
    <div ref={ref} className={cn("tooltip-content-base", hidden && "hidden", className)} {...props}>
      {children}
    </div>
  )
);
TooltipContent.displayName = "TooltipContent";

// --- End of Mock implementations ---


const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

// Create the context for the sidebar state.
const SidebarContext = React.createContext<SidebarContext | null>(null)

// Hook to access the sidebar context.
function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

// Provider component to manage the sidebar state.
const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean // Default state of the sidebar (open/closed)
    open?: boolean // Controlled state for the sidebar
    onOpenChange?: (open: boolean) => void // Callback when the state changes
  }
>(
  (
    {
      defaultOpen = true, // Default to open
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    // Check if the device is mobile using the custom hook.
    const isMobile = useIsMobile()
    // State for the mobile sheet visibility.
    const [openMobile, setOpenMobile] = React.useState(false)

    // Internal state for the sidebar open/closed status.
    // Use controlled state (openProp/setOpenProp) if provided, otherwise use internal state.
    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open

    // Function to set the sidebar state (open/closed).
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        // Determine the new state based on the value (can be a boolean or a function).
        const openState = typeof value === "function" ? value(open) : value
        // Call the external state setter if provided, otherwise update internal state.
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }

        // Persist the sidebar state in a cookie.
        // Check if document is available (runs only in browser)
        if (typeof document !== 'undefined') {
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
        }
      },
      [setOpenProp, open]
    )

    // Function to toggle the sidebar state (mobile or desktop).
    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open) // Toggle mobile sheet
        : setOpen((open) => !open) // Toggle desktop sidebar
    }, [isMobile, setOpen, setOpenMobile])

    // Effect to add a keyboard shortcut (Ctrl/Cmd + B) to toggle the sidebar.
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }
      // Add event listener only in the browser
       if (typeof window !== 'undefined') {
         window.addEventListener("keydown", handleKeyDown)
         return () => window.removeEventListener("keydown", handleKeyDown)
       }
    }, [toggleSidebar])

    // Determine the current state string ("expanded" or "collapsed").
    const state = open ? "expanded" : "collapsed"

    // Memoize the context value to prevent unnecessary re-renders.
    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    // Provide the context value to children.
    return (
      <SidebarContext.Provider value={contextValue}>
        {/* TooltipProvider is needed for menu item tooltips */}
        <TooltipProvider delayDuration={0}>
          {/* Main container div */}
          <div
            style={
              {
                // CSS variables for sidebar widths
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style, // Allow custom styles
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full", // Base styles
              // Add background if the inset variant is used within this provider
              "has-[[data-variant=inset]]:bg-sidebar",
              className // Allow custom classes
            )}
            ref={ref}
            {...props} // Pass down other props
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

// Main Sidebar component.
const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right" // Side of the screen (default: left)
    variant?: "sidebar" | "floating" | "inset" // Visual style (default: sidebar)
    collapsible?: "offcanvas" | "icon" | "none" // How it collapses (default: offcanvas)
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Get state and functions from the context.
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    // If collapsing is disabled, render a simple fixed-width sidebar.
    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground", // Basic styling
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    // On mobile, render the sidebar inside a Sheet component.
    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar" // Data attribute for styling/selection
            data-mobile="true" // Indicate mobile version
            className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden" // Styling for the sheet content
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE, // Use mobile width
              } as React.CSSProperties
            }
            side={side} // Set the side the sheet appears from
          >
            {/* Container for the sidebar content */}
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    // On desktop, render the collapsible sidebar.
    return (
      <div
        ref={ref}
        className="group peer hidden md:block text-sidebar-foreground" // Base styles, hidden on small screens
        data-state={state} // Current state (expanded/collapsed)
        data-collapsible={state === "collapsed" ? collapsible : ""} // Type of collapse when collapsed
        data-variant={variant} // Visual variant
        data-side={side} // Side (left/right)
      >
        {/* Placeholder div to create the gap/space for the fixed sidebar */}
        <div
          className={cn(
            "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear", // Base styles and transition
            // Adjust width based on collapse type and variant
            "group-data-[collapsible=offcanvas]:w-0", // Offcanvas hides the gap
            "group-data-[side=right]:rotate-180", // Adjust for right side
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]" // Icon collapse with padding for floating/inset
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]" // Icon collapse for standard sidebar
          )}
        />
        {/* Actual fixed sidebar container */}
        <div
          className={cn(
            "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex", // Base styles, fixed position, transition
            // Position based on side and collapse type
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" // Slide off left for offcanvas
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]", // Slide off right for offcanvas
            // Adjust width and padding based on variant and collapse type
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" // Icon collapse with padding for floating/inset
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l", // Icon collapse for standard, add border
            className // Allow custom classes
          )}
          {...props} // Pass down other props
        >
          {/* Inner container for styling (background, border-radius) */}
          <div
            data-sidebar="sidebar" // Data attribute
            className={cn(
              "flex h-full w-full flex-col bg-sidebar", // Base styles
              // Add rounded corners and border/shadow for floating variant
              "group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

// Button to toggle the sidebar visibility.
const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>, // Type of the underlying element (Button)
  React.ComponentProps<typeof Button> // Props accepted by Button
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar() // Get the toggle function

  return (
    <Button
      ref={ref}
      data-sidebar="trigger" // Data attribute
      variant="ghost" // Use ghost variant for subtle appearance
      size="icon" // Use icon size
      className={cn("h-7 w-7", className)} // Specific size and allow custom classes
      onClick={(event) => {
        onClick?.(event) // Call original onClick if provided
        toggleSidebar() // Toggle the sidebar state
      }}
      {...props} // Pass down other props
    >
      <PanelLeft /> {/* Icon for the trigger */}
      <span className="sr-only">Toggle Sidebar</span> {/* Accessibility label */}
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

// Invisible clickable rail to toggle the sidebar (usually positioned next to it).
const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar() // Get the toggle function

  return (
    <button
      ref={ref}
      data-sidebar="rail" // Data attribute
      aria-label="Toggle Sidebar" // Accessibility label
      tabIndex={-1} // Not focusable via keyboard navigation
      onClick={toggleSidebar} // Toggle on click
      title="Toggle Sidebar" // Tooltip text
      className={cn(
        // Base styles: positioned absolutely, specific width, visual indicator on hover
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        // Cursor changes based on side and state
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        // Adjustments for offcanvas collapse type
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className // Allow custom classes
      )}
      {...props} // Pass down other props
    />
  )
})
SidebarRail.displayName = "SidebarRail"

// Main content area component, adjusts its layout based on the sidebar variant.
const SidebarInset = React.forwardRef<
  HTMLDivElement, // Changed from main to div for flexibility, use <main> tag where needed
  React.ComponentProps<"div"> // Use div props
>(({ className, ...props }, ref) => {
  return (
    <div // Use div instead of main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background", // Base styles
        // Styles applied when the sidebar variant is "inset"
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className // Allow custom classes
      )}
      {...props} // Pass down other props
    />
  )
})
SidebarInset.displayName = "SidebarInset"

// Input component styled for the sidebar.
const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>, // Underlying element type (Input)
  React.ComponentProps<typeof Input> // Props accepted by Input
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input" // Data attribute
      className={cn(
        // Sidebar-specific input styling
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className // Allow custom classes
      )}
      {...props} // Pass down other props
    />
  )
})
SidebarInput.displayName = "SidebarInput"

// Header section container for the sidebar.
const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header" // Data attribute
      className={cn("flex flex-col gap-2 p-2", className)} // Padding and flex layout
      {...props} // Pass down other props
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

// Footer section container for the sidebar.
const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer" // Data attribute
      className={cn("flex flex-col gap-2 p-2", className)} // Padding and flex layout
      {...props} // Pass down other props
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

// Separator component styled for the sidebar.
const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>, // Underlying element type (Separator)
  React.ComponentProps<typeof Separator> // Props accepted by Separator
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator" // Data attribute
      className={cn("mx-2 w-auto bg-sidebar-border", className)} // Sidebar-specific separator styling
      {...props} // Pass down other props
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

// Main content area within the sidebar, responsible for scrolling.
const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content" // Data attribute
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2", // Base layout, flex-1 to take available space
        "overflow-y-auto", // **** ADDED: Enable vertical scrolling when content overflows ****
        "group-data-[collapsible=icon]:overflow-hidden", // Hide overflow when collapsed to icon mode
        className // Allow custom classes
      )}
      {...props} // Pass down other props
    />
  )
})
SidebarContent.displayName = "SidebarContent"

// Container for grouping sidebar items.
const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group" // Data attribute
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)} // Padding and layout
      {...props} // Pass down other props
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

// Label for a sidebar group.
const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean } // Allow rendering as a different element
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div" // Use Slot if asChild is true

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label" // Data attribute
      className={cn(
        // Base styles: padding, text style, focus ring
        "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Hide label smoothly when collapsed to icon mode
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className // Allow custom classes
      )}
      {...props} // Pass down other props
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

// Action button (e.g., add, settings) within a sidebar group header.
const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean } // Allow rendering as a different element
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button" // Use Slot if asChild is true

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action" // Data attribute
      className={cn(
        // Base styles: positioning, size, icon styling, focus ring, hover effect
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increase touch target size on mobile
        "after:absolute after:-inset-2 after:md:hidden",
        // Hide action when collapsed to icon mode
        "group-data-[collapsible=icon]:hidden",
        className // Allow custom classes
      )}
      {...props} // Pass down other props
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

// Content container within a sidebar group.
const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content" // Data attribute
    className={cn("w-full text-sm", className)} // Basic styling
    {...props} // Pass down other props
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

// Unordered list container for menu items.
const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu" // Data attribute
    className={cn("flex w-full min-w-0 flex-col gap-1", className)} // Layout for menu items
    {...props} // Pass down other props
  />
))
SidebarMenu.displayName = "SidebarMenu"

// List item container for a single menu item.
const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item" // Data attribute
    className={cn("group/menu-item relative", className)} // Relative positioning for actions/badges
    {...props} // Pass down other props
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

// Define variants for the menu button using class-variance-authority.
const sidebarMenuButtonVariants = cva(
  // Base styles shared by all variants
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      // Visual style variants
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      // Size variants
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0", // Larger size, adjust icon padding when collapsed
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Clickable button/link component for a menu item.
const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement, // Can be a button or, if asChild, the child element
  React.ComponentProps<"button"> & { // Base props
    asChild?: boolean // Render as child element?
    isActive?: boolean // Is this item currently active?
    tooltip?: string | React.ComponentProps<typeof TooltipContent> // Tooltip content or props
  } & VariantProps<typeof sidebarMenuButtonVariants> // Include CVA variants
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button" // Determine the component to render
    const { isMobile, state } = useSidebar() // Get sidebar state

    // Create the button element
    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button" // Data attribute
        data-size={size} // Size attribute
        data-active={isActive} // Active state attribute
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)} // Apply CVA variants and custom classes
        {...props} // Pass down other props
      />
    )

    // If no tooltip is provided, just return the button.
    if (!tooltip) {
      return button
    }

    // Normalize tooltip prop to be an object if it's a string.
    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      }
    }

    // Wrap the button in a Tooltip component if a tooltip is provided.
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger> {/* Trigger is the button itself */}
        <TooltipContent
          side="right" // Show tooltip to the right
          align="center" // Align center
          hidden={state !== "collapsed" || isMobile} // Only show tooltip when sidebar is collapsed on desktop
          {...tooltip} // Pass down tooltip content/props
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

// Action button (e.g., edit, delete) positioned within a menu item.
const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean // Render as child element?
    showOnHover?: boolean // Only show when the menu item is hovered/focused?
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button" // Determine the component to render

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action" // Data attribute
      className={cn(
        // Base styles: positioning, size, icon styling, focus ring, hover effect
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increase touch target size on mobile
        "after:absolute after:-inset-2 after:md:hidden",
        // Adjust vertical position based on the main button's size
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        // Hide action when collapsed to icon mode
        "group-data-[collapsible=icon]:hidden",
        // Optionally hide until hover/focus
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className // Allow custom classes
      )}
      {...props} // Pass down other props
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

// Badge component (e.g., notification count) positioned within a menu item.
const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="menu-badge" // Data attribute
    className={cn(
      // Base styles: positioning, size, text style, non-interactive
      "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
      // Adjust text color based on the main button's state
      "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
      // Adjust vertical position based on the main button's size
      "peer-data-[size=sm]/menu-button:top-1",
      "peer-data-[size=default]/menu-button:top-1.5",
      "peer-data-[size=lg]/menu-button:top-2.5",
      // Hide badge when collapsed to icon mode
      "group-data-[collapsible=icon]:hidden",
      className // Allow custom classes
    )}
    {...props} // Pass down other props
  />
))
SidebarMenuBadge.displayName = "SidebarMenuBadge"

// Skeleton loader component for menu items.
const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean // Show a placeholder for the icon?
  }
>(({ className, showIcon = false, ...props }, ref) => {
  // Generate a random width for the text skeleton for visual variation.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%` // Width between 50% and 90%
  }, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton" // Data attribute
      className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)} // Layout matching a menu item
      {...props} // Pass down other props
    >
      {/* Optional icon skeleton */}
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      {/* Text skeleton with random width */}
      <Skeleton
        className="h-4 flex-1 max-w-[--skeleton-width]"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width, // Apply random width via CSS variable
          } as React.CSSProperties
        }
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

// Unordered list container for sub-menu items.
const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub" // Data attribute
    className={cn(
      // Indentation and border styling for sub-menu
      "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
      // Hide sub-menu when collapsed to icon mode
      "group-data-[collapsible=icon]:hidden",
      className // Allow custom classes
    )}
    {...props} // Pass down other props
  />
))
SidebarMenuSub.displayName = "SidebarMenuSub"

// List item container for a sub-menu item.
const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ ...props }, ref) => <li ref={ref} {...props} />) // Simple list item
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

// Clickable button/link component for a sub-menu item.
const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement, // Typically an anchor link
  React.ComponentProps<"a"> & { // Anchor props
    asChild?: boolean // Render as child element?
    size?: "sm" | "md" // Size variant
    isActive?: boolean // Is this item currently active?
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a" // Determine the component to render

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button" // Data attribute
      data-size={size} // Size attribute
      data-active={isActive} // Active state attribute
      className={cn(
        // Base styles: height, padding, text style, focus ring, hover/active states
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        // Active state styling
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        // Text size based on variant
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        // Hide sub-button when collapsed to icon mode
        "group-data-[collapsible=icon]:hidden",
        className // Allow custom classes
      )}
      {...props} // Pass down other props
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

// Export all the components.
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}

// --- Example Usage (App Component) ---

// Mock Icons (replace with actual imports e.g., from lucide-react)
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/></svg>;


// Basic CSS for mock components (add to your global CSS or a <style> tag)
/*
.button-base { padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 0.25rem; cursor: pointer; }
.button-base.ghost { border: none; background: transparent; }
.button-base.icon { padding: 0.5rem; }
.input-base { padding: 0.5rem; border: 1px solid #ccc; border-radius: 0.25rem; }
.separator-base { height: 1px; background-color: #eee; margin: 0.5rem 0; }
.sheet-base[data-state='closed'] { display: none; }
.sheet-content-base { position: fixed; top: 0; bottom: 0; background: white; box-shadow: -2px 0 5px rgba(0,0,0,0.1); padding: 1rem; z-index: 50; }
.sheet-content-base.side-left { left: 0; }
.sheet-content-base.side-right { right: 0; }
.sheet-close-button { position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; }
.skeleton-base { background-color: #e2e8f0; border-radius: 0.25rem; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
.tooltip-base { position: relative; display: inline-block; }
.tooltip-content-base { position: absolute; background-color: #333; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem; z-index: 100; white-space: nowrap; }
.tooltip-content-base.hidden { display: none; }
.bg-sidebar { background-color: #f8fafc; /* Example color */}
.text-sidebar-foreground { color: #0f172a; /* Example color */}
.bg-sidebar-border { background-color: #e2e8f0; /* Example color */}
.ring-sidebar-ring:focus-visible { outline: 2px solid blue; /* Example focus */}
.bg-sidebar-accent { background-color: #e0f2fe; /* Example color */}
.text-sidebar-accent-foreground { color: #0c4a6e; /* Example color */}
.bg-background { background-color: #ffffff; /* Example color */}
*/

function App() {
  const [subOpen, setSubOpen] = React.useState(false);

  return (
    <SidebarProvider defaultOpen> {/* Wrap with Provider */}
      <Sidebar collapsible="icon" side="left" variant="sidebar"> {/* Sidebar component */}
        <SidebarHeader> {/* Header section */}
          <div className="flex items-center justify-between">
             {/* Logo or title area */}
             <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                <div className="p-1 rounded-lg bg-blue-500 text-white group-data-[collapsible=icon]:size-6 flex items-center justify-center"> {/* Simple Logo */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M4.5 7.5a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zm0 2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zm-.5 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5"/></svg>
                </div>
                <span className="font-semibold group-data-[collapsible=icon]:hidden">My App</span>
             </div>
            <SidebarTrigger className="group-data-[collapsible=icon]:hidden" /> {/* Trigger to collapse/expand */}
          </div>
          <SidebarInput placeholder="Search..." /> {/* Search input */}
        </SidebarHeader>

        <SidebarContent> {/* Main scrollable content area */}
          <SidebarGroup> {/* Group of items */}
            <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu> {/* Menu list */}
                <SidebarMenuItem> {/* Menu item */}
                  <SidebarMenuButton tooltip="Home" isActive> {/* Button with tooltip */}
                    <HomeIcon />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings">
                    <SettingsIcon />
                    <span>Settings</span>
                  </SidebarMenuButton>
                   {/* Example Submenu */}
                   <SidebarMenuSub>
                     <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#">Profile</SidebarMenuSubButton>
                     </SidebarMenuSubItem>
                     <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#" isActive>Billing</SidebarMenuSubButton>
                     </SidebarMenuSubItem>
                   </SidebarMenuSub>
                </SidebarMenuItem>
                 {/* Collapsible Submenu Example */}
                 <SidebarMenuItem>
                   <SidebarMenuButton
                     tooltip="Users"
                     onClick={() => setSubOpen(!subOpen)}
                     data-state={subOpen ? 'open' : 'closed'}
                   >
                     <UserIcon />
                     <span>Users</span>
                     <ChevronDownIcon className="ml-auto size-4 transition-transform duration-200 group-data-[collapsible=icon]:hidden data-[state=open]:rotate-180" />
                   </SidebarMenuButton>
                   {subOpen && (
                     <SidebarMenuSub>
                       <SidebarMenuSubItem>
                         <SidebarMenuSubButton href="#">All Users</SidebarMenuSubButton>
                       </SidebarMenuSubItem>
                       <SidebarMenuSubItem>
                         <SidebarMenuSubButton href="#">Add New</SidebarMenuSubButton>
                       </SidebarMenuSubItem>
                     </SidebarMenuSub>
                   )}
                 </SidebarMenuItem>

                 {/* Add more items to test scrolling */}
                 {[...Array(20)].map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuButton tooltip={`Item ${i + 1}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.055.48.132.57.203.09.07.143.18.143.319v.317a.5.5 0 0 1-.854.354l-.622-.622a.5.5 0 0 1 .316-.99h.883c.28-.047.47-.149.56-.295.09-.146.12-.34.12-.586v-.659a.5.5 0 0 1 .271-.45l.563-.281c.16-.08.308-.189.437-.335a.5.5 0 0 1 .416-.235c.123 0 .239.05.328.139.09.087.15.217.175.372l.078.477a.5.5 0 0 1-.424.552l-.25.042z"/></svg>
                        <span>Scroll Item {i + 1}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                 ))}

              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter> {/* Footer section */}
           <SidebarSeparator />
           <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Profile">
                        <UserIcon />
                        <span>Your Profile</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
        <SidebarRail /> {/* Clickable rail (optional) */}
      </Sidebar>

      {/* Main content area that adjusts based on sidebar */}
      <SidebarInset>
        <div className="p-4">
          <h1>Main Content Area</h1>
          <p>This content will be pushed or overlaid depending on the sidebar state and variant.</p>
          {/* Add a button to toggle sidebar on mobile */}
          <SidebarTrigger className="md:hidden fixed top-4 right-4 z-20" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App; // Export the App component for rendering

