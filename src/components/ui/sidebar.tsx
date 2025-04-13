import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft, HomeIcon as DefaultHomeIcon, SettingsIcon as DefaultSettingsIcon, UserIcon as DefaultUserIcon, PlusIcon as DefaultPlusIcon, ChevronDownIcon as DefaultChevronDownIcon } from "lucide-react" // Using lucide-react directly

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
    if (typeof window === 'undefined') return; // Guard for SSR
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
    <button ref={ref} className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        // Example variants - replace with your actual button styles
        variant === 'ghost' ? 'hover:bg-accent hover:text-accent-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90',
        size === 'icon' ? 'h-10 w-10' : 'h-10 py-2 px-4',
        className
        )} {...props} />
  )
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn("flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />
  )
);
Input.displayName = "Input";

const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { orientation?: 'horizontal' | 'vertical' }>(
  ({ className, orientation = 'horizontal', ...props }, ref) => (
    <div ref={ref} className={cn("shrink-0 bg-border", orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]', className)} {...props} />
  )
);
Separator.displayName = "Separator";

const Sheet = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => {
    // Basic Sheet implementation for example
    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <div className={cn("fixed inset-0 z-50", open ? "block" : "hidden")}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30" onClick={() => onOpenChange?.(false)} />
            {children}
        </div>
    );
};


const SheetContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { side?: 'left' | 'right' | 'top' | 'bottom' }>(
  ({ className, side = 'left', children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out duration-300",
            side === 'left' && 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
            side === 'right' && 'inset-y-0 right-0 h-full w-3/4 border-l data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
            // Add top/bottom variants if needed
            className
        )}
        // Add data-state attribute based on open prop passed to Sheet
        data-state={(props as any).open ? 'open' : 'closed'}
        {...props}
        >
      {children}
      {/* Simple close button for demo */}
      <button
        onClick={() => (props as any).onOpenChange?.(false)}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
        >
         {/* Use a proper close icon */}
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg>
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
);
SheetContent.displayName = "SheetContent";

const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
  )
);
Skeleton.displayName = "Skeleton";

const TooltipProvider = ({ children, delayDuration }: { children: React.ReactNode; delayDuration?: number }) => (
  // In a real app, this would likely use Radix UI TooltipProvider
  <>{children}</>
);

const Tooltip = ({ children }: { children: React.ReactNode }) => (
  // In a real app, this would likely use Radix UI Tooltip
  <>{children}</> // Simplified for example
);

const TooltipTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
   // In a real app, this would likely use Radix UI TooltipTrigger
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children); // Pass props through
  }
  return <button type="button">{children}</button>; // Default trigger
};

const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { side?: string; align?: string; hidden?: boolean }>(
  ({ className, side, align, hidden, children, ...props }, ref) => (
     // In a real app, this would likely use Radix UI TooltipContent
     // This is a very basic visual representation
    <div ref={ref} className={cn("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95", hidden && "hidden", className)} {...props}>
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
    const { isMobile, state, openMobile, setOpenMobile, setOpen: setDesktopOpen } = useSidebar() // Added setDesktopOpen for Sheet

    // If collapsing is disabled, render a simple fixed-width sidebar.
    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-[var(--sidebar-width)] flex-col bg-sidebar text-sidebar-foreground", // Basic styling
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
            open={openMobile} // Pass open state to SheetContent for data-state
            onOpenChange={setOpenMobile} // Pass callback
            data-sidebar="sidebar" // Data attribute for styling/selection
            data-mobile="true" // Indicate mobile version
            className="w-[var(--sidebar-width)] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden" // Styling for the sheet content
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
            "duration-200 relative h-svh w-[var(--sidebar-width)] bg-transparent transition-[width] ease-linear", // Base styles and transition
            // Adjust width based on collapse type and variant
            "group-data-[collapsible=offcanvas]:w-0", // Offcanvas hides the gap
            "group-data-[side=right]:rotate-180", // Adjust for right side
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]" // Icon collapse with padding for floating/inset
              : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]" // Icon collapse for standard sidebar
          )}
        />
        {/* Actual fixed sidebar container */}
        <div
          className={cn(
            "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] ease-linear md:flex", // Base styles, fixed position, transition
            // Position based on side and collapse type
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" // Slide off left for offcanvas
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]", // Slide off right for offcanvas
            // Adjust width and padding based on variant and collapse type
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" // Icon collapse with padding for floating/inset
              : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[side=left]:border-r group-data-[side=right]:border-l", // Icon collapse for standard, add border
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
      <PanelLeft className="h-4 w-4" /> {/* Icon for the trigger */}
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
        // Assuming 'theme(spacing.4)' is defined in your Tailwind config (e.g., 1rem)
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4,1rem))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
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
      // Removed gap-2 here, let children manage their gap if needed
      className={cn("flex flex-col p-2", className)} // Padding and flex layout
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
      // Removed gap-2 here
      className={cn("flex flex-col p-2", className)} // Padding and flex layout
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
      className={cn("mx-2 my-1 w-auto bg-sidebar-border", className)} // Sidebar-specific separator styling, added margin-y
      {...props} // Pass down other props
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

// Main content area within the sidebar, responsible for scrolling.
// **** MODIFIED FOR SCROLLING ****
const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content" // Data attribute
      className={cn(
        "relative flex-1 min-h-0", // Outer container: takes remaining space, allows shrinking, relative positioning
        "group-data-[collapsible=icon]:overflow-hidden", // Hide everything when collapsed to icon
        className // Allow custom classes
      )}
      {...props} // Pass down other props
    >
      {/* Inner container: absolutely positioned to fill outer, enables scrolling */}
      <div className="absolute inset-0 overflow-y-auto">
        {/* Add padding or gap for the actual content inside the scrollable area */}
        <div className="flex flex-col gap-2 p-2 pt-0"> {/* Added padding here, removed from outer */}
            {children}
        </div>
      </div>
    </div>
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
      // Removed padding here, handled by SidebarContent inner div
      className={cn("relative flex w-full min-w-0 flex-col", className)}
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
        "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Hide label smoothly when collapsed to icon mode
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:px-0", // Added px-0 when icon
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
        "absolute right-1 top-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", // Adjusted position slightly
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
    className={cn("w-full text-sm flex flex-col gap-1", className)} // Basic styling, added gap
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
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all duration-150 ease-in-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 [&>span:not(.sr-only)]:group-data-[collapsible=icon]:hidden [&>svg~svg]:group-data-[collapsible=icon]:hidden [&>svg]:size-4 [&>svg]:shrink-0", // Modified icon collapse behavior
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
      children, // Accept children
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
      >
          {children}
      </Comp>
    )

    // If no tooltip is provided, just return the button.
    if (!tooltip) {
      return button
    }

    // Normalize tooltip prop to be an object if it's a string.
    if (typeof tooltip === "string") {
      tooltip = {
        children: <span className="px-1">{tooltip}</span>, // Wrap string tooltip for basic styling
        // Add default side/align for consistency if needed
         side: "right",
         align: "center",
         sideOffset: 8, // Add some offset
      }
    } else {
        tooltip = {
            side: "right",
            align: "center",
            sideOffset: 8,
            ...tooltip // Merge provided props
        }
    }

    // Wrap the button in a Tooltip component if a tooltip is provided.
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger> {/* Trigger is the button itself */}
        <TooltipContent
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
      "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground select-none pointer-events-none", // Updated styles for badge
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
>(({ className, showIcon = true, ...props }, ref) => { // Default showIcon to true
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
          className="size-4 rounded-sm shrink-0" // Changed to rounded-sm
          data-sidebar="menu-skeleton-icon"
        />
      )}
      {/* Text skeleton with random width */}
      <Skeleton
        className="h-4 flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
             maxWidth: `var(--skeleton-width, ${width})`, // Apply random width via CSS variable, fallback
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
      "ml-5 mt-1 flex min-w-0 flex-col gap-1 border-l border-border pl-3.5", // Updated styling
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
>(({ asChild = false, size = "md", isActive, className, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "a" // Determine the component to render

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button" // Data attribute
      data-size={size} // Size attribute
      data-active={isActive} // Active state attribute
      className={cn(
        // Base styles: height, padding, text style, focus ring, hover/active states
        "flex h-7 w-full min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground/80 outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active::opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground", // Adjusted text color
        // Active state styling
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium", // Added font-medium on active
        // Text size based on variant
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        // Hide sub-button when collapsed to icon mode
        "group-data-[collapsible=icon]:hidden",
        className // Allow custom classes
      )}
      {...props} // Pass down other props
    >
        {children}
    </Comp>
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

// Use default icons from lucide-react if not overridden
const HomeIcon = DefaultHomeIcon;
const SettingsIcon = DefaultSettingsIcon;
const UserIcon = DefaultUserIcon;
const PlusIcon = DefaultPlusIcon;
const ChevronDownIcon = DefaultChevronDownIcon;

// Mock Logo component
const MockLogo = () => (
    <div className="p-1.5 rounded-lg bg-blue-600 text-white group-data-[collapsible=icon]:size-6 flex items-center justify-center transition-all"> {/* Simple Logo */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M4.5 7.5a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zm0 2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zm-.5 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5"/></svg>
    </div>
)

// Basic CSS variables (add to your global CSS or style tag)
// These should match your Tailwind theme ideally
/*
:root {
  --sidebar: #f8fafc; // Example: Cool Gray 50
  --sidebar-foreground: #1f2937; // Example: Cool Gray 800
  --sidebar-border: #e5e7eb; // Example: Cool Gray 200
  --sidebar-accent: #e0f2fe; // Example: Sky 100
  --sidebar-accent-foreground: #075985; // Example: Sky 800
  --sidebar-ring: #3b82f6; // Example: Blue 500
  --background: #ffffff;
  --border: #e5e7eb; // General border color
  --input: #e5e7eb; // Input border
  --ring: #3b82f6; // Focus ring
  --primary: #3b82f6; // Example: Blue 500
  --primary-foreground: #ffffff;
  --accent: #f3f4f6; // Used by mock Button
  --accent-foreground: #1f2937; // Used by mock Button
  --popover: #ffffff;
  --popover-foreground: #1f2937;
  --muted: #f3f4f6; // Used by Skeleton
}

// Simple animation definitions if not using Tailwind animations plugin
@keyframes slide-in-from-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@keyframes slide-out-to-left { from { transform: translateX(0); } to { transform: translateX(-100%); } }
@keyframes slide-in-from-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes slide-out-to-right { from { transform: translateX(0); } to { transform: translateX(100%); } }
@keyframes fade-in-0 { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoom-in-95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

.animate-in { animation-duration: 300ms; animation-timing-function: ease-out; }
.animate-out { animation-duration: 200ms; animation-timing-function: ease-in; }
.slide-in-from-left { animation-name: slide-in-from-left; }
.slide-out-to-left { animation-name: slide-out-to-left; }
.slide-in-from-right { animation-name: slide-in-from-right; }
.slide-out-to-right { animation-name: slide-out-to-right; }
.fade-in-0 { animation-name: fade-in-0; }
.zoom-in-95 { animation-name: zoom-in-95; }

// Tailwind theme function mock (basic)
.m-2 { margin: 0.5rem; }
.ml-2 { margin-left: 0.5rem; }
.p-2 { padding: 0.5rem; }
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.pt-0 { padding-top: 0; }
.px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
.px-1\.5 { padding-left: 0.375rem; padding-right: 0.375rem; }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.px-2\.5 { padding-left: 0.625rem; padding-right: 0.625rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.px-3\.5 { padding-left: 0.875rem; padding-right: 0.875rem; }
.py-0\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
.py-1\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }
.mx-2 { margin-left: 0.5rem; margin-right: 0.5rem; }
.mx-3\.5 { margin-left: 0.875rem; margin-right: 0.875rem; }
.my-1 { margin-top: 0.25rem; margin-bottom: 0.25rem; }
.ml-5 { margin-left: 1.25rem; }
.ml-auto { margin-left: auto; }
.min-h-svh { min-height: 100svh; }
.min-h-0 { min-height: 0; }
.min-w-0 { min-width: 0; }
.min-w-5 { min-width: 1.25rem; }
.w-full { width: 100%; }
.w-auto { width: auto; }
.w-3\/4 { width: 75%; }
.w-4 { width: 1rem; }
.w-5 { width: 1.25rem; }
.h-full { height: 100%; }
.h-svh { height: 100svh; }
.h-4 { height: 1rem; }
.h-5 { height: 1.25rem; }
.h-7 { height: 1.75rem; }
.h-8 { height: 2rem; }
.h-12 { height: 3rem; }
.size-4 { width: 1rem; height: 1rem; }
.size-6 { width: 1.5rem; height: 1.5rem; }
.size-8 { width: 2rem; height: 2rem; }
.aspect-square { aspect-ratio: 1 / 1; }
.flex { display: flex; }
.flex-1 { flex: 1 1 0%; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.shrink-0 { flex-shrink: 0; }
.overflow-hidden { overflow: hidden; }
.overflow-y-auto { overflow-y: auto; }
.rounded-md { border-radius: 0.375rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.rounded-full { border-radius: 9999px; }
.rounded-sm { border-radius: 0.125rem; }
.border { border-width: 1px; }
.border-r { border-right-width: 1px; }
.border-l { border-left-width: 1px; }
.shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
.shadow-none { box-shadow: none; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-left { text-align: left; }
.text-sidebar-foreground { color: var(--sidebar-foreground); }
.text-sidebar-foreground\/70 { color: color-mix(in srgb, var(--sidebar-foreground) 70%, transparent); }
.text-sidebar-foreground\/80 { color: color-mix(in srgb, var(--sidebar-foreground) 80%, transparent); }
.text-sidebar-accent-foreground { color: var(--sidebar-accent-foreground); }
.text-primary-foreground { color: var(--primary-foreground); }
.bg-sidebar { background-color: var(--sidebar); }
.bg-sidebar-border { background-color: var(--sidebar-border); }
.bg-sidebar-accent { background-color: var(--sidebar-accent); }
.bg-background { background-color: var(--background); }
.bg-transparent { background-color: transparent; }
.bg-primary { background-color: var(--primary); }
.bg-border { background-color: var(--border); }
.bg-popover { background-color: var(--popover); }
.bg-muted { background-color: var(--muted); }
.border-sidebar-border { border-color: var(--sidebar-border); }
.border-input { border-color: var(--input); }
.border-border { border-color: var(--border); }
.ring-sidebar-ring:focus-visible { --tw-ring-color: var(--sidebar-ring); box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--tw-ring-color); } // Adjusted focus ring
.focus-visible\:ring-2:focus-visible { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); } // Basic ring setup
.focus-visible\:ring-sidebar-ring:focus-visible { --tw-ring-color: var(--sidebar-ring); }
.absolute { position: absolute; }
.relative { position: relative; }
.fixed { position: fixed; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.inset-y-0 { top: 0; bottom: 0; }
.left-0 { left: 0; }
.right-0 { right: 0; }
.right-1 { right: 0.25rem; }
.right-3 { right: 0.75rem; }
.right-4 { right: 1rem; }
.-right-2 { right: -0.5rem; }
.-right-4 { right: -1rem; }
.top-1 { top: 0.25rem; }
.top-1\.5 { top: 0.375rem; }
.top-2\.5 { top: 0.625rem; }
.top-3\.5 { top: 0.875rem; }
.top-4 { top: 1rem; }
.z-10 { z-index: 10; }
.z-20 { z-index: 20; }
.z-50 { z-index: 50; }
.hidden { display: none; }
.block { display: block; }
.inline-flex { display: inline-flex; }
.md\:block { @media (min-width: 768px) { display: block; } }
.md\:flex { @media (min-width: 768px) { display: flex; } }
.md\:hidden { @media (min-width: 768px) { display: none; } }
.sm\:flex { @media (min-width: 640px) { display: flex; } }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tabular-nums { font-variant-numeric: tabular-nums; }
.select-none { user-select: none; }
.pointer-events-none { pointer-events: none; }
.cursor-w-resize { cursor: w-resize; }
.cursor-e-resize { cursor: e-resize; }
.transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-\[width\] { transition-property: width; }
.transition-\[left\,right\,width\] { transition-property: left, right, width; }
.transition-\[margin\,opacity\] { transition-property: margin, opacity; }
.transition-transform { transition-property: transform; }
.duration-150 { transition-duration: 150ms; }
.duration-200 { transition-duration: 200ms; }
.ease-linear { transition-timing-function: linear; }
.ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
.translate-x-px { transform: translateX(1px); }
.-translate-x-1\/2 { transform: translateX(-50%); }
.translate-x-0 { transform: translateX(0); }
.rotate-180 { transform: rotate(180deg); }
.after\:absolute::after { content: ""; position: absolute; }
.after\:inset-y-0::after { top: 0; bottom: 0; }
.after\:left-1\/2::after { left: 50%; }
.after\:w-\[2px\]::after { width: 2px; }
.after\:left-full::after { left: 100%; }
.after\:-inset-2::after { top: -0.5rem; right: -0.5rem; bottom: -0.5rem; left: -0.5rem; }
.after\:md\:hidden::after { @media (min-width: 768px) { display: none; } }
.hover\:after\:bg-sidebar-border:hover::after { background-color: var(--sidebar-border); }
.hover\:bg-sidebar:hover { background-color: var(--sidebar); }
.hover\:bg-sidebar-accent:hover { background-color: var(--sidebar-accent); }
.hover\:text-sidebar-accent-foreground:hover { color: var(--sidebar-accent-foreground); }
.hover\:shadow-\[0_0_0_1px_hsl\(var\(--sidebar-accent\)\)\]:hover { box-shadow: 0 0 0 1px var(--sidebar-accent); }
.outline-none { outline: 2px solid transparent; outline-offset: 2px; }
.focus-visible\:ring-2:focus-visible { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
.active\:bg-sidebar-accent:active { background-color: var(--sidebar-accent); }
.active\:text-sidebar-accent-foreground:active { color: var(--sidebar-accent-foreground); }
.disabled\:pointer-events-none:disabled { pointer-events: none; }
.disabled\:opacity-50:disabled { opacity: 0.5; }
.aria-disabled\:pointer-events-none[aria-disabled=true] { pointer-events: none; }
.aria-disabled\:opacity-50[aria-disabled=true] { opacity: 0.5; }
.group\/sidebar-wrapper {}
.group\/menu-item {}
.group-data-\[\[data-variant=inset\]\]\:bg-sidebar.has-\[\[data-variant=inset\]\] { background-color: var(--sidebar); }
.group-data-\[collapsible=offcanvas\]\:w-0[data-collapsible=offcanvas] { width: 0; }
.group-data-\[side=right\]\:rotate-180[data-side=right] { transform: rotate(180deg); }
.group-data-\[collapsible=icon\]\:w-\[calc\(var\(--sidebar-width-icon\)_+_theme\(spacing\.4\)\)\][data-collapsible=icon] { width: calc(var(--sidebar-width-icon) + 1rem); } // Assuming theme(spacing.4) = 1rem
.group-data-\[collapsible=icon\]\:w-\[var\(--sidebar-width-icon\)\][data-collapsible=icon] { width: var(--sidebar-width-icon); }
.group-data-\[collapsible=offcanvas\]\:left-\[calc\(var\(--sidebar-width\)*-1\)\][data-collapsible=offcanvas] { left: calc(var(--sidebar-width) * -1); }
.group-data-\[collapsible=offcanvas\]\:right-\[calc\(var\(--sidebar-width\)*-1\)\][data-collapsible=offcanvas] { right: calc(var(--sidebar-width) * -1); }
.group-data-\[collapsible=icon\]\:w-\[calc\(var\(--sidebar-width-icon\)_+_theme\(spacing\.4\)_+2px\)\][data-collapsible=icon] { width: calc(var(--sidebar-width-icon) + 1rem + 2px); } // Assuming theme(spacing.4) = 1rem
.group-data-\[side=left\]\:border-r[data-side=left] { border-right-width: 1px; border-color: var(--sidebar-border); }
.group-data-\[side=right\]\:border-l[data-side=right] { border-left-width: 1px; border-color: var(--sidebar-border); }
.group-data-\[variant=floating\]\:rounded-lg[data-variant=floating] { border-radius: 0.5rem; }
.group-data-\[variant=floating\]\:border[data-variant=floating] { border-width: 1px; }
.group-data-\[variant=floating\]\:border-sidebar-border[data-variant=floating] { border-color: var(--sidebar-border); }
.group-data-\[variant=floating\]\:shadow[data-variant=floating] { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
.group-data-\[collapsible=icon\]\:hidden[data-collapsible=icon] { display: none; }
.group-data-\[collapsible=icon\]\:-mt-8[data-collapsible=icon] { margin-top: -2rem; }
.group-data-\[collapsible=icon\]\:opacity-0[data-collapsible=icon] { opacity: 0; }
.group-data-\[collapsible=icon]\:px-0[data-collapsible=icon] { padding-left: 0; padding-right: 0; }
.group-data-\[collapsible=icon\]\:overflow-hidden[data-collapsible=icon] { overflow: hidden; }
.group-data-\[collapsible=icon\]\:justify-center[data-collapsible=icon] { justify-content: center; }
.group-data-\[collapsible=icon\]\:\!size-8[data-collapsible=icon] { width: 2rem !important; height: 2rem !important; }
.group-data-\[collapsible=icon\]\:\!p-0[data-collapsible=icon] { padding: 0 !important; }
.group-has-\[\[data-sidebar=menu-action\]\]\/menu-item\:pr-8.group\/menu-item:has([data-sidebar=menu-action]) { padding-right: 2rem; }
.group-focus-within\/menu-item\:opacity-100.group\/menu-item:focus-within { opacity: 1; }
.group-hover\/menu-item\:opacity-100.group\/menu-item:hover { opacity: 1; }
.data-\[active=true\]\:bg-sidebar-accent[data-active=true] { background-color: var(--sidebar-accent); }
.data-\[active=true\]\:font-medium[data-active=true] { font-weight: 500; }
.data-\[active=true\]\:text-sidebar-accent-foreground[data-active=true] { color: var(--sidebar-accent-foreground); }
.data-\[state=open\]\:hover\:bg-sidebar-accent[data-state=open]:hover { background-color: var(--sidebar-accent); }
.data-\[state=open\]\:hover\:text-sidebar-accent-foreground[data-state=open]:hover { color: var(--sidebar-accent-foreground); }
.data-\[state=open\]\:opacity-100[data-state=open] { opacity: 1; }
.data-\[state=open]\:bg-sidebar-accent[data-state=open] { background-color: var(--sidebar-accent); }
.data-\[state=open]\:text-sidebar-accent-foreground[data-state=open] { color: var(--sidebar-accent-foreground); }
.data-\[state=open\]\:rotate-180[data-state=open] { transform: rotate(180deg); }
.peer-data-\[variant=inset\]\:min-h-\[calc\(100svh-theme\(spacing\.4\,1rem\)\)\]:is([data-variant=inset] ~ *) { min-height: calc(100svh - 1rem); } // Adjusted peer selector
.peer-data-\[variant=inset\]\:m-2:is([data-variant=inset] ~ *) { @media (min-width: 768px) { margin: 0.5rem; } }
.peer-data-\[state=collapsed\]\:peer-data-\[variant=inset\]\:ml-2:is([data-state=collapsed][data-variant=inset] ~ *) { @media (min-width: 768px) { margin-left: 0.5rem; } }
.peer-data-\[variant=inset\]\:ml-0:is([data-variant=inset] ~ *) { @media (min-width: 768px) { margin-left: 0; } }
.peer-data-\[variant=inset\]\:rounded-xl:is([data-variant=inset] ~ *) { @media (min-width: 768px) { border-radius: 0.75rem; } }
.peer-data-\[variant=inset\]\:shadow:is([data-variant=inset] ~ *) { @media (min-width: 768px) { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); } }
.peer-hover\/menu-button\:text-sidebar-accent-foreground:is(:hover ~ .peer\/menu-button), .peer\/menu-button:hover ~ * { color: var(--sidebar-accent-foreground); } // Complex peer hover needs adjustment based on structure
.peer-data-\[active=true\]\/menu-button\:text-sidebar-accent-foreground:is([data-active=true] ~ .peer\/menu-button), .peer\/menu-button[data-active=true] ~ * { color: var(--sidebar-accent-foreground); } // Complex peer active needs adjustment
.peer-data-\[size=sm\]\/menu-button\:top-1:is([data-size=sm] ~ .peer\/menu-button), .peer\/menu-button[data-size=sm] ~ * { top: 0.25rem; }
.peer-data-\[size=default\]\/menu-button\:top-1\.5:is([data-size=default] ~ .peer\/menu-button), .peer\/menu-button[data-size=default] ~ * { top: 0.375rem; }
.peer-data-\[size=lg\]\/menu-button\:top-2\.5:is([data-size=lg] ~ .peer\/menu-button), .peer\/menu-button[data-size=lg] ~ * { top: 0.625rem; }
.\!size-8 { width: 2rem !important; height: 2rem !important; } // Need important for override
.\!p-0 { padding: 0 !important; } // Need important for override
.\&>span:not\(\.sr-only\)\:group-data-\[collapsible=icon\]\:hidden > span:not(.sr-only)[data-collapsible=icon] { display: none; } // Needs specific parent selector context
.\&>svg~svg\:group-data-\[collapsible=icon\]\:hidden > svg ~ svg[data-collapsible=icon] { display: none; } // Needs specific parent selector context
.\&>svg\:size-4 > svg { width: 1rem; height: 1rem; }
.\&>svg\:shrink-0 > svg { flex-shrink: 0; }

// Placeholder styles for theme() function usage - replace with actual Tailwind setup
.min-h-\[calc\(100svh-theme\(spacing\.4\,1rem\)\)\] { min-height: calc(100svh - 1rem); }
.w-\[calc\(var\(--sidebar-width-icon\)_+_theme\(spacing\.4\)\)\] { width: calc(var(--sidebar-width-icon) + 1rem); }
.w-\[calc\(var\(--sidebar-width-icon\)_+_theme\(spacing\.4\)_+2px\)\] { width: calc(var(--sidebar-width-icon) + 1rem + 2px); }

*/


function App() {
  const [subOpen, setSubOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true); // Simulate loading state

  // Simulate loading data
  React.useEffect(() => {
    const timer = setTimeout(() => {
        setIsLoading(false);
    }, 1500); // Simulate 1.5 second load time
    return () => clearTimeout(timer);
  }, []);


  return (
    <SidebarProvider defaultOpen> {/* Wrap with Provider */}
      <Sidebar collapsible="icon" side="left" variant="sidebar"> {/* Sidebar component */}
        <SidebarHeader> {/* Header section */}
          <div className="flex items-center justify-between pb-2"> {/* Added padding-bottom */}
             {/* Logo or title area */}
             <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center flex-grow min-w-0"> {/* Added flex-grow and min-w-0 */}
                <MockLogo />
                <span className="font-semibold truncate group-data-[collapsible=icon]:hidden">My Application Name That Might Be Long</span> {/* Added truncate */}
             </div>
            <SidebarTrigger className="ml-1 shrink-0" /> {/* Trigger to collapse/expand, added margin and shrink */}
          </div>
          <SidebarInput placeholder="Search..." className="group-data-[collapsible=icon]:hidden"/> {/* Search input, hidden when icon */}
          <SidebarInput placeholder="S" className="hidden group-data-[collapsible=icon]:block w-8 h-8 mx-auto my-1 text-center p-0" /> {/* Icon search placeholder */}
        </SidebarHeader>

        <SidebarContent> {/* Main scrollable content area */}
          {isLoading ? (
             // Loading State Skeletons
             <div className="flex flex-col gap-2">
                 <SidebarMenuSkeleton />
                 <SidebarMenuSkeleton />
                 <SidebarGroupLabel><Skeleton className="h-4 w-1/2" /></SidebarGroupLabel>
                 <SidebarMenuSkeleton />
                 <SidebarMenuSkeleton />
                 <SidebarMenuSkeleton />
                 <SidebarSeparator className="!mx-0" /> {/* Use !mx-0 to override default margin */}
                 <SidebarMenuSkeleton />
                 <SidebarMenuSkeleton />
             </div>
          ) : (
            // Actual Content
            <>
                <SidebarMenu> {/* Menu list */}
                    <SidebarMenuItem> {/* Menu item */}
                    <SidebarMenuButton tooltip="Home" isActive> {/* Button with tooltip */}
                        <HomeIcon />
                        <span>Home</span>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                    <SidebarMenuButton
                        tooltip="Settings"
                        onClick={() => setSubOpen(!subOpen)}
                        data-state={subOpen ? 'open' : 'closed'}
                    >
                        <SettingsIcon />
                        <span>Settings</span>
                        <ChevronDownIcon className="ml-auto size-4 transition-transform duration-200 group-data-[collapsible=icon]:hidden data-[state=open]:rotate-180" />
                    </SidebarMenuButton>
                    {/* Collapsible Submenu */}
                    {subOpen && (
                        <SidebarMenuSub>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton href="#" isActive>Profile</SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton href="#">Appearance</SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton href="#">Notifications</SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        </SidebarMenuSub>
                    )}
                    </SidebarMenuItem>
                </SidebarMenu>

                <SidebarSeparator />

                <SidebarGroup> {/* Group of items */}
                    <SidebarGroupLabel className="flex justify-between items-center">
                        <span>Projects</span>
                        <SidebarGroupAction asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5"><PlusIcon className="h-3 w-3"/></Button>
                        </SidebarGroupAction>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                    <SidebarMenu>
                        {/* Add more items to test scrolling */}
                        {[...Array(25)].map((_, i) => (
                            <SidebarMenuItem key={i}>
                            <SidebarMenuButton tooltip={{ children: `Project ${i + 1} - A slightly longer description for tooltip`, side: 'right', align: 'start' }}>
                                {/* Placeholder Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="text-gray-500"><path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V7.879a.5.5 0 0 0-.146-.353l-4-4A.5.5 0 0 0 9.5 3H3.5zm0 1h5.793L13 7.207V12.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5z"/></svg>
                                <span>Project {i + 1}</span>
                                <SidebarMenuBadge>{i * 3}</SidebarMenuBadge>
                                {/* Example Action */}
                                <SidebarMenuAction showOnHover>
                                    <SettingsIcon className="h-3 w-3"/>
                                </SidebarMenuAction>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </>
          )}
        </SidebarContent>

        <SidebarFooter> {/* Footer section */}
           <SidebarSeparator />
           <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="My Profile">
                        <UserIcon />
                        <span>Ahmad Al-Masri</span> {/* Example username */}
                    </SidebarMenuButton>
                </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
        <SidebarRail /> {/* Clickable rail (optional) */}
      </Sidebar>

      {/* Main content area that adjusts based on sidebar */}
      <SidebarInset>
        <div className="p-6"> {/* Increased padding */}
          <div className="flex justify-between items-center mb-4">
             <h1 className="text-2xl font-semibold">Main Content Area</h1>
             {/* Add a button to toggle sidebar on mobile - positioned inside content */}
             <SidebarTrigger className="md:hidden" />
          </div>
          <p className="text-gray-600 mb-4">This content will be pushed or overlaid depending on the sidebar state and variant. The scroll bar should now appear within the sidebar itself when the content exceeds the available height.</p>
          {/* Example content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {[...Array(9)].map((_, i) => (
                 <div key={i} className="border rounded-lg p-4 shadow-sm bg-white">
                     <h3 className="font-medium mb-2">Card Title {i+1}</h3>
                     <p className="text-sm text-gray-500">Some placeholder content for the card to demonstrate how the main area looks.</p>
                 </div>
             ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App; // Export the App component for rendering


التغييرات الرئيسية (الطريقة المبتكرة):
 * تعديل SidebarContent:
   * أصبح SidebarContent الآن حاوية خارجية (relative, flex-1, min-h-0).
   * تمت إضافة div داخلي (absolute inset-0 overflow-y-auto). هذا الـ div الداخلي يملأ الحاوية الخارجية بالكامل وهو المسؤول حصريًا عن التمرير.
   * تم نقل padding و gap إلى div آخر داخل الحاوية القابلة للتمرير لضمان وجود مساحة حول المحتوى الفعلي الذي يتم تمريره.
لماذا هذه الطريقة مبتكرة وقد تنجح:
 * فصل التحكم: تفصل هذه الطريقة بين حاوية التخطيط (SidebarContent الخارجي) وحاوية التمرير (div الداخلي). هذا يعطي المتصفح تعليمات واضحة جدًا حول الجزء الذي يجب أن يطبق عليه التمرير.
 * position: absolute: استخدام position: absolute مع inset: 0 يضمن أن الحاوية الداخلية للتمرير تأخذ بالضبط حجم الحاوية الخارجية (SidebarContent) بغض النظر عن محتواها الأولي.
 * min-h-0 و flex-1: هذه الخصائص على الحاوية الخارجية ضرورية للسماح لها بالتقلص والتمدد لتناسب المساحة المتاحة بين SidebarHeader و SidebarFooter في تخطيط flex العمودي للمكون Sidebar.
ملاحظات إضافية:
 * الاعتمادات الوهمية: تأكد من استبدال المكونات والأدوات المساعدة الوهمية (cn, Button, Input... إلخ) بالاستيرادات الفعلية من مشروعك (مثل lucide-react, @radix-ui/react-slot, مكتبة UI الخاصة بك مثل shadcn/ui). لقد قمت بتضمين استيرادات أساسية من lucide-react وبعض الأنماط الأساسية لمحاولة جعل المثال يعمل بشكل مستقل قدر الإمكان.
 * CSS/Tailwind: تأكد من أن لديك Tailwind CSS مهيأ بشكل صحيح في مشروعك وأن المتغيرات (--sidebar, --sidebar-border, إلخ) والفئات المساعدة (theme(), peer-data-*, group-data-*...) تعمل كما هو متوقع. لقد أضفت قسم CSS أساسي مع متغيرات وفئات وهمية لتقريب الشكل.
 * المحتوى التجريبي: أضفت المزيد من العناصر (Project 1 إلى Project 25) داخل SidebarContent للتأكد من وجود محتوى كافٍ لتجاوز ارتفاع الشاشة واختبار التمرير.
 * حالة التحميل: أضفت مثالاً بسيطًا لحالة التحميل باستخدام SidebarMenuSkeleton لإظهار كيف يمكن أن يبدو الشريط الجانبي أثناء جلب البيانات.
جرب هذا الكود المحدث. يجب أن يضمن الهيكل الجديد لـ SidebarContent ظهور شريط التمرير عند الحاجة إليه.
