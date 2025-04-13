import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
// Using lucide-react directly for icons
import { PanelLeft, HomeIcon as DefaultHomeIcon, SettingsIcon as DefaultSettingsIcon, UserIcon as DefaultUserIcon, PlusIcon as DefaultPlusIcon, ChevronDownIcon as DefaultChevronDownIcon, X as DefaultXIcon } from "lucide-react"

// --- Mock implementations for missing imports (Assume these exist or replace with your actual imports) ---
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
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

// --- Mock Sheet Components ---
// NOTE: A real Sheet implementation (like Radix UI or shadcn/ui) is complex.
// These mocks provide basic structure and state handling for the example.
const SheetContext = React.createContext<{ open: boolean; onOpenChange: (open: boolean) => void } | null>(null);

const Sheet = ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => {
    React.useEffect(() => {
        if (typeof document === 'undefined') return;
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    const contextValue = React.useMemo(() => ({ open, onOpenChange }), [open, onOpenChange]);

    return (
        <SheetContext.Provider value={contextValue}>
            <div className={cn("fixed inset-0 z-50", open ? "block" : "hidden")}>
                {/* Overlay */}
                <div className="fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
                     onClick={() => onOpenChange?.(false)}
                     data-state={open ? 'open' : 'closed'}
                />
                {children}
            </div>
        </SheetContext.Provider>
    );
};

const SheetContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { side?: 'left' | 'right' | 'top' | 'bottom' }>(
  ({ className, side = 'left', children, ...props }, ref) => {
    const context = React.useContext(SheetContext);
    if (!context) {
        // Render nothing or throw error if not inside Sheet
        return null;
    }
    const { open, onOpenChange } = context;

    // Define animation classes based on side
    const animationClasses = {
        left: "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        right: "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        top: "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
    };

    return (
        <div
            ref={ref}
            className={cn(
                "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out",
                side === 'left' && `inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm ${animationClasses.left}`,
                side === 'right' && `inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm ${animationClasses.right}`,
                side === 'top' && `inset-x-0 top-0 border-b ${animationClasses.top}`,
                side === 'bottom' && `inset-x-0 bottom-0 border-t ${animationClasses.bottom}`,
                className
            )}
            data-state={open ? 'open' : 'closed'}
            {...props}
            >
        {children}
        {/* Simple close button for demo */}
        <button
            onClick={() => onOpenChange?.(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
            >
            <DefaultXIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </button>
        </div>
    );
  }
);
SheetContent.displayName = "SheetContent";
// --- End Mock Sheet Components ---


const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
  )
);
Skeleton.displayName = "Skeleton";

// --- Mock Tooltip Components ---
// NOTE: Using basic divs for tooltip structure. Real tooltips are more complex.
const TooltipContext = React.createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

const TooltipProvider = ({ children, delayDuration = 0 }: { children: React.ReactNode; delayDuration?: number }) => {
    // Provider doesn't do much in this basic mock
    return <>{children}</>;
};

const Tooltip = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false);
    const contextValue = React.useMemo(() => ({ open, setOpen }), [open]);
    return <TooltipContext.Provider value={contextValue}>{children}</TooltipContext.Provider>;
};

const TooltipTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
    const context = React.useContext(TooltipContext);
    const triggerRef = React.useRef<HTMLElement>(null);

    const handleMouseEnter = () => context?.setOpen(true);
    const handleMouseLeave = () => context?.setOpen(false);
    const handleFocus = () => context?.setOpen(true);
    const handleBlur = () => context?.setOpen(false);

    if (asChild && React.isValidElement(children)) {
        // Clone element and add event handlers
        return React.cloneElement(children, {
            ref: triggerRef, // Forward ref if needed
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onFocus: handleFocus,
            onBlur: handleBlur,
            ...children.props, // Keep original props
        } as React.HTMLAttributes<HTMLElement>);
    }

    // Default trigger is a span
    return (
        <span
            ref={triggerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            tabIndex={0} // Make it focusable
        >
            {children}
        </span>
    );
};

const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { side?: 'top' | 'right' | 'bottom' | 'left'; align?: 'start' | 'center' | 'end'; sideOffset?: number; hidden?: boolean }>(
  ({ className, side = 'top', align = 'center', sideOffset = 4, hidden = false, children, ...props }, ref) => {
    const context = React.useContext(TooltipContext);
    if (!context?.open || hidden) return null; // Don't render if not open or explicitly hidden

    // Basic positioning logic (very simplified)
    const positionClasses = {
        top: "bottom-full mb-1",
        right: "left-full ml-1",
        bottom: "top-full mt-1",
        left: "right-full mr-1",
    };
    const alignClasses = {
        start: "items-start",
        center: "items-center",
        end: "items-end",
    };

    return (
     // Wrapper for positioning relative to trigger (assumes trigger is relative or static)
     <div className={cn("absolute z-50 flex", positionClasses[side], alignClasses[align])} style={{ margin: `${sideOffset}px` }}>
        <div ref={ref} className={cn("overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95", className)} {...props}>
        {children}
        </div>
     </div>
    );
  }
);
TooltipContent.displayName = "TooltipContent";
// --- End Mock Tooltip Components ---


const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const SIDEBAR_WIDTH = "16rem" // Standard width
const SIDEBAR_WIDTH_MOBILE = "18rem" // Width on mobile
const SIDEBAR_WIDTH_ICON = "3.5rem" // Width when collapsed to icons (increased slightly)
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean // Desktop state
  setOpen: (open: boolean) => void
  openMobile: boolean // Mobile state
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
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    // Internal state for the desktop sidebar open/closed status.
    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open

    // Function to set the desktop sidebar state (open/closed).
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
        if (typeof document !== 'undefined') {
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
        }
      },
      [setOpenProp, open]
    )

    // Function to toggle the sidebar state (mobile or desktop).
    const toggleSidebar = React.useCallback(() => {
      if (isMobile) {
        setOpenMobile((current) => !current);
      } else {
        setOpen((current) => !current);
      }
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

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          {/* Main container div */}
          <div
            style={
              {
                // CSS variables for sidebar widths
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON, // Use updated icon width
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full", // Base styles
              // Add background if the inset variant is used within this provider
              "has-[[data-variant=inset]]:bg-sidebar",
              className
            )}
            ref={ref}
            {...props}
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
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "icon", // Default to icon collapse
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    // --- Mobile View ---
    if (isMobile) {
      // Use the Sheet component for mobile display
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            side={side}
            className={cn(
                "w-[var(--sidebar-width-mobile)] bg-sidebar p-0 text-sidebar-foreground flex flex-col", // Ensure flex-col here
                className // Allow overriding classes
                )}
            style={{ "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
            {...props} // Pass other props like aria-label etc.
            >
             {/* The children (Header, Content, Footer) are rendered directly */}
             {children}
          </SheetContent>
        </Sheet>
      )
    }

    // --- Desktop View ---
    // If collapsing is disabled, render a simple fixed-width sidebar.
    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-svh w-[var(--sidebar-width)] flex-col border-r bg-sidebar text-sidebar-foreground", // Added border-r for clarity
            side === 'right' && 'border-l border-r-0', // Adjust border for right side
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    // Desktop collapsible sidebar
    return (
      <div
        ref={ref}
        className={cn(
            "group peer hidden md:block text-sidebar-foreground", // Base styles, hidden on small screens
            variant === 'floating' && 'p-2', // Add padding for floating variant wrapper
            variant === 'inset' && 'p-2', // Add padding for inset variant wrapper
            )}
        data-state={state} // Current state (expanded/collapsed)
        data-collapsible={state === "collapsed" ? collapsible : ""} // Type of collapse when collapsed
        data-variant={variant} // Visual variant
        data-side={side} // Side (left/right)
      >
        {/* Placeholder div to create the gap/space for the fixed sidebar */}
        <div
          className={cn(
            "relative h-svh bg-transparent transition-[width] duration-300 ease-in-out", // Base styles and transition
            // Width adjustment based on state and type
            state === 'expanded' && 'w-[var(--sidebar-width)]',
            state === 'collapsed' && collapsible === 'icon' && 'w-[var(--sidebar-width-icon)]',
            state === 'collapsed' && collapsible === 'offcanvas' && 'w-0',
            // Add padding adjustment for floating/inset when icon collapsed
            (variant === 'floating' || variant === 'inset') && state === 'collapsed' && collapsible === 'icon' && 'w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4,1rem))]', // Add space around icon sidebar
            // Adjust for right side (rotation not needed here)
          )}
        />
        {/* Actual fixed sidebar container */}
        <div
          className={cn(
            "fixed inset-y-0 z-20 flex h-svh transition-[width,left,right] duration-300 ease-in-out", // Base styles, fixed position, transition
            // Positioning based on side and state
            side === 'left' && state === 'expanded' && 'left-0 w-[var(--sidebar-width)]',
            side === 'left' && state === 'collapsed' && collapsible === 'icon' && 'left-0 w-[var(--sidebar-width-icon)]',
            side === 'left' && state === 'collapsed' && collapsible === 'offcanvas' && 'left-[calc(var(--sidebar-width)*-1)] w-[var(--sidebar-width)]', // Offcanvas hidden left

            side === 'right' && state === 'expanded' && 'right-0 w-[var(--sidebar-width)]',
            side === 'right' && state === 'collapsed' && collapsible === 'icon' && 'right-0 w-[var(--sidebar-width-icon)]',
            side === 'right' && state === 'collapsed' && collapsible === 'offcanvas' && 'right-[calc(var(--sidebar-width)*-1)] w-[var(--sidebar-width)]', // Offcanvas hidden right

            // Adjust padding/width for floating/inset variants when icon collapsed
            (variant === 'floating' || variant === 'inset') && state === 'collapsed' && collapsible === 'icon' && 'w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4,1rem))] p-2',
            // Standard border for sidebar variant
            variant === 'sidebar' && side === 'left' && 'border-r',
            variant === 'sidebar' && side === 'right' && 'border-l',
            className // Allow custom classes
          )}
          {...props} // Pass down other props
        >
          {/* Inner container for styling (background, border-radius, flex layout) */}
          {/* **** IMPORTANT: Added flex flex-col h-full here **** */}
          <div
            data-sidebar="sidebar" // Data attribute
            className={cn(
              "flex h-full w-full flex-col bg-sidebar", // Base styles, ensure flex column and full height
              // Add rounded corners and border/shadow for floating/inset variant
              (variant === "floating" || variant === "inset") && "rounded-lg border border-border shadow-md"
            )}
          >
            {/* Children (Header, Content, Footer) are rendered here and will inherit flex context */}
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
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar, isMobile, state } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", // Consistent size
        // Hide on desktop when sidebar is collapsed to icon only
        !isMobile && state === 'collapsed' && 'hidden',
       className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

// Invisible clickable rail to toggle the sidebar (usually positioned next to it).
const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar, state } = useSidebar()

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        // Base styles: positioned absolutely, specific width, visual indicator on hover
        "absolute inset-y-0 z-10 hidden w-4 -translate-x-1/2 transition-all duration-200 ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        // Cursor changes based on side and state
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        // Adjustments for offcanvas collapse type (if used)
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        // Hide if not icon collapsible or if offcanvas
        "group-data-[collapsible=offcanvas]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarRail.displayName = "SidebarRail"

// Main content area component, adjusts its layout based on the sidebar variant.
const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div // Use div, can be wrapped in <main> by user
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background transition-[margin-left,margin-right] duration-300 ease-in-out", // Added transition
        // Styles applied when the sidebar variant is "inset"
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.8,2rem))] md:peer-data-[variant=inset]:m-4 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-md", // Adjusted margin/padding
        // Adjust margin based on sidebar state and side for non-inset variants
        "md:peer-data-[state=expanded]:peer-data-[side=left]:peer-data-[variant=sidebar]:ml-[var(--sidebar-width)]",
        "md:peer-data-[state=expanded]:peer-data-[side=right]:peer-data-[variant=sidebar]:mr-[var(--sidebar-width)]",
        "md:peer-data-[state=collapsed]:peer-data-[collapsible=icon]:peer-data-[side=left]:peer-data-[variant=sidebar]:ml-[var(--sidebar-width-icon)]",
        "md:peer-data-[state=collapsed]:peer-data-[collapsible=icon]:peer-data-[side=right]:peer-data-[variant=sidebar]:mr-[var(--sidebar-width-icon)]",
        // Adjust margin for inset/floating variants when collapsed to icon
        "md:peer-data-[state=collapsed]:peer-data-[collapsible=icon]:peer-data-[side=left]:peer-data-[variant=inset]:ml-[calc(var(--sidebar-width-icon)_+_theme(spacing.4,1rem))]",
        "md:peer-data-[state=collapsed]:peer-data-[collapsible=icon]:peer-data-[side=right]:peer-data-[variant=inset]:mr-[calc(var(--sidebar-width-icon)_+_theme(spacing.4,1rem))]",
         "md:peer-data-[state=collapsed]:peer-data-[collapsible=icon]:peer-data-[side=left]:peer-data-[variant=floating]:ml-[calc(var(--sidebar-width-icon)_+_theme(spacing.4,1rem))]",
        "md:peer-data-[state=collapsed]:peer-data-[collapsible=icon]:peer-data-[side=right]:peer-data-[variant=floating]:mr-[calc(var(--sidebar-width-icon)_+_theme(spacing.4,1rem))]",

        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

// Input component styled for the sidebar.
const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        // Sidebar-specific input styling
        "h-9 w-full bg-background shadow-none focus-visible:ring-1 focus-visible:ring-ring", // Adjusted height/ring
        "group-data-[state=collapsed]/sidebar-wrapper:hidden", // Hide when sidebar group is collapsed (using provider's group)
        className
      )}
      {...props}
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
      data-sidebar="header"
      // **** IMPORTANT: Added shrink-0 to prevent header growing ****
      className={cn("flex flex-col shrink-0 p-3", className)} // Use p-3 for consistency
      {...props}
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
      data-sidebar="footer"
      // **** IMPORTANT: Added shrink-0 to prevent footer growing ****
      className={cn("flex flex-col shrink-0 p-3 mt-auto", className)} // Use p-3, mt-auto pushes to bottom
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

// Separator component styled for the sidebar.
const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("my-2 bg-border", className)} // Adjusted margin/color
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

// Main content area within the sidebar, responsible for scrolling.
// **** REVERTED TO SIMPLER APPROACH ****
const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content" // Data attribute
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden px-3", // Take remaining space, enable Y scroll, hide X scroll, add padding
        "group-data-[state=collapsed]/sidebar-wrapper:px-0", // Remove padding when collapsed
        className // Allow custom classes
      )}
      {...props} // Pass down other props
    >
        {/* Children are rendered directly inside the scrollable area */}
        {children}
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
      className={cn(
        "relative flex w-full min-w-0 flex-col",
        "group-data-[state=expanded]/sidebar-wrapper:pb-4", // Add padding bottom only when expanded
         className)}
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

// Label for a sidebar group.
const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        // Base styles: padding, text style, focus ring
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground", // Adjusted styling
        // Hide label smoothly when collapsed to icon mode
        "group-data-[state=collapsed]/sidebar-wrapper:hidden", // Hide completely when collapsed
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

// Action button (e.g., add, settings) within a sidebar group header.
const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        // Base styles: positioning, size, icon styling, focus ring, hover effect
        "absolute right-1 top-1 flex aspect-square w-6 h-6 items-center justify-center rounded-md p-0 text-muted-foreground outline-none ring-ring transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 [&>svg]:size-4 [&>svg]:shrink-0", // Adjusted size/styling
        // Increase touch target size on mobile
        "after:absolute after:-inset-1 after:md:hidden",
        // Hide action when collapsed to icon mode
        "group-data-[state=collapsed]/sidebar-wrapper:hidden",
        className
      )}
      {...props}
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
    data-sidebar="group-content"
    className={cn("w-full text-sm flex flex-col gap-0.5 mt-1", className)} // Added gap/margin
    {...props}
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
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-0.5", className)} // Adjusted gap
    {...props}
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
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

// Define variants for the menu button using class-variance-authority.
const sidebarMenuButtonVariants = cva(
  // Base styles shared by all variants
  "peer/menu-button relative flex w-full items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm outline-none ring-ring transition-all duration-100 ease-in-out hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 active:bg-accent disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
  // Collapsed state styles using group data attribute from provider
  "group-data-[state=collapsed]/sidebar-wrapper:justify-center group-data-[state=collapsed]/sidebar-wrapper:px-0 group-data-[state=collapsed]/sidebar-wrapper:size-9", // Adjusted size for collapsed
  // Hide text span when collapsed
  "[&>span:not(.sr-only)]:group-data-[state=collapsed]/sidebar-wrapper:hidden",
  // Hide secondary icons (like dropdown arrow) when collapsed
  "[&>svg~svg]:group-data-[state=collapsed]/sidebar-wrapper:hidden",
  // Icon styling
  "[&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      // Visual style variants
      variant: {
        default: "hover:bg-accent hover:text-accent-foreground",
        outline: "bg-transparent border border-border hover:bg-accent hover:text-accent-foreground", // Adjusted outline
      },
      // Size variants
      size: {
        default: "h-9", // Adjusted height
        sm: "h-8 text-xs",
        lg: "h-11 text-base", // Adjusted height/size
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
    asChild?: boolean
    isActive?: boolean
    tooltip?: React.ReactNode | React.ComponentProps<typeof TooltipContent> // Allow ReactNode for tooltip
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
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state } = useSidebar() // Get sidebar state (expanded/collapsed)

    // Create the button element
    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      >
          {children}
      </Comp>
    )

    // If no tooltip is provided, or if expanded on desktop, or on mobile, return the button directly.
    if (!tooltip || (!isMobile && state === 'expanded') || isMobile) {
      return button
    }

    // Prepare tooltip props
    let tooltipProps: React.ComponentProps<typeof TooltipContent> = {
        side: "right",
        align: "center",
        sideOffset: 8,
        hidden: state === 'expanded' || isMobile, // Ensure hidden logic matches condition above
    };

    if (React.isValidElement(tooltip) || typeof tooltip === 'string' || typeof tooltip === 'number') {
        tooltipProps.children = tooltip; // Use ReactNode directly
    } else if (typeof tooltip === 'object' && tooltip !== null) {
        // If it's an object, assume it's TooltipContent props
        tooltipProps = { ...tooltipProps, ...tooltip };
    } else {
        return button; // Invalid tooltip type
    }


    // Wrap the button in a Tooltip component only when collapsed on desktop
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent {...tooltipProps} />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

// Action button (e.g., edit, delete) positioned within a menu item.
const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = true, ...props }, ref) => { // Default showOnHover to true
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        // Base styles: positioning, size, icon styling, focus ring, hover effect
        "absolute right-1 top-1/2 -translate-y-1/2 flex aspect-square w-6 h-6 items-center justify-center rounded-md p-0 text-muted-foreground outline-none ring-ring transition-opacity hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 [&>svg]:size-4 [&>svg]:shrink-0", // Centered vertically
        // Increase touch target size on mobile
        "after:absolute after:-inset-1 after:md:hidden",
        // Hide action when collapsed to icon mode (using provider group)
        "group-data-[state=collapsed]/sidebar-wrapper:hidden",
        // Optionally hide until hover/focus
        showOnHover && "opacity-0 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100",
        className
      )}
      {...props}
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
    data-sidebar="menu-badge"
    className={cn(
      // Base styles: positioning, size, text style, non-interactive
      "absolute right-2 top-1/2 -translate-y-1/2 ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground select-none pointer-events-none", // Centered vertically, adjusted position/styling
      // Hide badge when collapsed to icon mode (using provider group)
      "group-data-[state=collapsed]/sidebar-wrapper:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuBadge.displayName = "SidebarMenuBadge"

// Skeleton loader component for menu items.
const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean // Show a placeholder for the icon?
  }
>(({ className, showIcon = true, ...props }, ref) => {
  const width = React.useMemo(() => `${Math.floor(Math.random() * 40) + 50}%`, []) // 50% to 90%

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("rounded-md h-9 flex gap-2 px-2 items-center", className)} // Match button height
      {...props}
    >
      {showIcon && (
        <Skeleton className="size-4 rounded-sm shrink-0" data-sidebar="menu-skeleton-icon" />
      )}
      <Skeleton
        className="h-4 flex-1"
        data-sidebar="menu-skeleton-text"
        style={{ maxWidth: `var(--skeleton-width, ${width})` } as React.CSSProperties}
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
    data-sidebar="menu-sub"
    className={cn(
      // Indentation and border styling for sub-menu
      "ml-5 mt-1 flex min-w-0 flex-col gap-0.5 border-l border-border pl-4", // Adjusted padding/margin
      // Hide sub-menu when collapsed to icon mode (using provider group)
      "group-data-[state=collapsed]/sidebar-wrapper:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuSub.displayName = "SidebarMenuSub"

// List item container for a sub-menu item.
const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ ...props }, ref) => <li ref={ref} {...props} />)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

// Clickable button/link component for a sub-menu item.
const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement, // Typically an anchor link
  React.ComponentProps<"a"> & { // Anchor props
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }
>(({ asChild = false, size = "md", isActive, className, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        // Base styles: height, padding, text style, focus ring, hover/active states
        "flex h-8 w-full min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-muted-foreground outline-none ring-ring transition-colors duration-100 hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 active:bg-accent disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", // Adjusted styling
        // Active state styling
        "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:font-medium",
        // Text size based on variant
        size === "sm" && "text-xs h-7", // Adjusted height for sm
        size === "md" && "text-sm",
        // Hide sub-button when collapsed to icon mode (using provider group)
        "group-data-[state=collapsed]/sidebar-wrapper:hidden",
        className
      )}
      {...props}
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
const FolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.54 3.87.5 10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V4.5a2 2 0 0 0-2-2h-6.528a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 3.828 2H2.5a2 2 0 0 0-2 2zM2.19 3c.24 0 .47.042.684.117l.597.347a1 1 0 0 0 .707.034L4.828 3h6.672a1 1 0 0 1 1 1V4H2.5a.5.5 0 0 1-.31-.094zm11.31 8.874a1 1 0 0 1-1 1H2.5a1 1 0 0 1-1-1V4.5h13z"/></svg>;


// Mock Logo component
const MockLogo = () => (
    <div className="p-1.5 rounded-lg bg-blue-600 text-white group-data-[state=expanded]/sidebar-wrapper:mr-2 group-data-[state=collapsed]/sidebar-wrapper:size-7 flex items-center justify-center transition-all shrink-0"> {/* Adjusted collapsed size */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M4.5 7.5a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zm0 2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zm-.5 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5"/></svg>
    </div>
)

// Basic CSS variables and utility classes (ensure these align with your Tailwind setup)
/*
:root {
  --sidebar: #f8fafc;
  --sidebar-foreground: #1f2937;
  --sidebar-border: #e5e7eb;
  --sidebar-accent: #e0f2fe;
  --sidebar-accent-foreground: #075985;
  --sidebar-ring: #3b82f6;
  --background: #ffffff;
  --foreground: #1f2937;
  --border: #e5e7eb;
  --input: #e5e7eb;
  --ring: #3b82f6;
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  --secondary: #f3f4f6;
  --secondary-foreground: #1f2937;
  --accent: #f3f4f6;
  --accent-foreground: #1f2937;
  --muted: #f3f4f6;
  --muted-foreground: #6b7280;
  --popover: #ffffff;
  --popover-foreground: #1f2937;
}

// Add simplified animation keyframes if not using a plugin
@keyframes slide-in-from-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@keyframes slide-out-to-left { from { transform: translateX(0); } to { transform: translateX(-100%); } }
@keyframes slide-in-from-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes slide-out-to-right { from { transform: translateX(0); } to { transform: translateX(100%); } }
@keyframes fade-in-0 { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoom-in-95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }


// Add basic utility classes here if needed for the mock components to render visually
// e.g., .flex, .items-center, .p-4, .rounded-md, .border, .bg-background, etc.
// It's better to rely on your actual Tailwind setup.

*/

function App() {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [projectsOpen, setProjectsOpen] = React.useState(true); // Keep projects open by default
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SidebarProvider defaultOpen> {/* Use Provider */}
      <Sidebar collapsible="icon" side="left" variant="sidebar"> {/* Sidebar Component */}
        {/* Sidebar Header */}
        <SidebarHeader>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-0 flex-grow min-w-0"> {/* Reduced gap */}
                <MockLogo />
                <span className="font-semibold text-lg truncate group-data-[state=collapsed]/sidebar-wrapper:hidden">App Name</span>
             </div>
            <SidebarTrigger className="ml-1 shrink-0 group-data-[state=collapsed]/sidebar-wrapper:hidden" /> {/* Hide trigger when collapsed */}
          </div>
          <div className="mt-3 group-data-[state=collapsed]/sidebar-wrapper:hidden"> {/* Add margin top */}
            <SidebarInput placeholder="Search..." />
          </div>
        </SidebarHeader>

        {/* Sidebar Scrollable Content */}
        <SidebarContent>
          {isLoading ? (
             // Loading Skeletons
             <div className="flex flex-col gap-1 pt-2">
                 <SidebarMenuSkeleton />
                 <SidebarSeparator/>
                 <SidebarMenuSkeleton showIcon={false} />
                 <SidebarMenuSkeleton />
                 <SidebarMenuSkeleton />
                 <SidebarSeparator/>
                 <SidebarMenuSkeleton />
             </div>
          ) : (
            // Actual Content
            <div className="pt-2"> {/* Add padding top to content */}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Home" isActive>
                            <HomeIcon /> <span>Home</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Settings"
                            onClick={() => setSettingsOpen(!settingsOpen)}
                            data-state={settingsOpen ? 'open' : 'closed'}
                        >
                            <SettingsIcon /> <span>Settings</span>
                            <ChevronDownIcon className="ml-auto size-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                        {settingsOpen && (
                            <SidebarMenuSub>
                                <SidebarMenuSubItem><SidebarMenuSubButton href="#">Profile</SidebarMenuSubButton></SidebarMenuSubItem>
                                <SidebarMenuSubItem><SidebarMenuSubButton href="#" isActive>Appearance</SidebarMenuSubButton></SidebarMenuSubItem>
                                <SidebarMenuSubItem><SidebarMenuSubButton href="#">Notifications</SidebarMenuSubButton></SidebarMenuSubItem>
                            </SidebarMenuSub>
                        )}
                    </SidebarMenuItem>
                </SidebarMenu>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel className="flex justify-between items-center px-2"> {/* Added padding to label */}
                        <span>Projects</span>
                        <SidebarGroupAction asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6"><PlusIcon className="h-4 w-4"/></Button>
                        </SidebarGroupAction>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {/* Example Project Items */}
                            {[...Array(30)].map((_, i) => (
                                <SidebarMenuItem key={i}>
                                    <SidebarMenuButton tooltip={`Project ${i + 1}`}>
                                        <FolderIcon className="text-gray-500" />
                                        <span>Project Alpha {i + 1}</span>
                                        {i % 5 === 0 && <SidebarMenuBadge>{i+1}</SidebarMenuBadge>}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </div>
          )}
        </SidebarContent>

        {/* Sidebar Footer */}
        <SidebarFooter>
           <SidebarSeparator />
           <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="My Profile">
                        <UserIcon />
                        <span>Ahmad Al-Masri</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>

        {/* Optional Rail for Desktop */}
        <SidebarRail />
      </Sidebar>

      {/* Main Content Area */}
      <SidebarInset>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
             <h1 className="text-3xl font-bold">Dashboard</h1>
             {/* Mobile Trigger */}
             <SidebarTrigger className="md:hidden" />
          </div>
          <p className="text-muted-foreground mb-6">Welcome to your dashboard. The sidebar should now scroll correctly when content overflows.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {[...Array(12)].map((_, i) => (
                 <div key={i} className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
                     <h3 className="font-semibold mb-2 text-foreground">Card {i+1}</h3>
                     <p className="text-sm text-muted-foreground">This is some placeholder content inside a card in the main area.</p>
                 </div>
             ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
```
