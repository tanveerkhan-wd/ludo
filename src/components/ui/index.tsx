import * as React from "react";
import { createPortal } from "react-dom";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ... (Badge, Button, Input components remain unchanged)

// Select Component
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, value, onChange, placeholder, disabled, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const updateCoords = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    React.useEffect(() => {
      if (isOpen) {
        updateCoords();
        window.addEventListener('scroll', updateCoords, true);
        window.addEventListener('resize', updateCoords);
      }
      return () => {
        window.removeEventListener('scroll', updateCoords, true);
        window.removeEventListener('resize', updateCoords);
      };
    }, [isOpen]);

    // Parse options from children
    const options = React.useMemo(() => {
      return React.Children.map(children, (child) => {
        if (React.isValidElement(child) && (child.type === 'option' || (child.props as any).value !== undefined)) {
          return {
            value: (child.props as any).value,
            label: (child.props as any).children,
          };
        }
        return null;
      })?.filter(Boolean) || [];
    }, [children]);

    const currentOption = options.find((opt) => String(opt.value) === String(value));

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          const dropdownList = document.getElementById('select-dropdown-portal');
          if (dropdownList && !dropdownList.contains(event.target as Node)) {
            setIsOpen(false);
          }
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div 
        className={cn(
          "relative w-full min-w-[120px] transition-all",
          !className?.includes('bg-') && "bg-[#121212]/50",
          !className?.includes('border') && "border border-white/10",
          !className?.includes('rounded') && "rounded-xl",
          isOpen && "border-purple-500/50 ring-2 ring-purple-500/20",
          disabled && "cursor-not-allowed opacity-50 bg-white/5",
          className
        )} 
        ref={containerRef}
      >
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "flex h-full w-full items-center justify-between rounded-[inherit] bg-transparent px-5 text-sm text-white transition-all hover:bg-white/5 focus:outline-none",
            disabled && "cursor-not-allowed"
          )}
        >
          <span className="truncate pr-4 font-semibold tracking-tight">
            {currentOption ? currentOption.label : placeholder || options[0]?.label || 'Select...'}
          </span>
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="w-4 h-4 text-gray-500 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>

        {mounted && createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                id="select-dropdown-portal"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 8 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                style={{ 
                  position: 'absolute',
                  top: coords.top,
                  left: coords.left,
                  width: coords.width,
                  zIndex: 9999
                }}
                className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0a0a0a]/98 backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]"
              >
                <div className="max-h-80 overflow-y-auto p-2 no-scrollbar">
                  {options.map((option) => (
                    <button
                      key={String(option.value)}
                      type="button"
                      onClick={() => {
                        if (onChange) {
                          const event = {
                            target: { value: option.value }
                          } as React.ChangeEvent<HTMLSelectElement>;
                          onChange(event);
                        }
                        setIsOpen(false);
                      }}
                      className={cn(
                        "group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition-all mb-1 last:mb-0",
                        String(value) === String(option.value)
                          ? "bg-purple-600 text-white font-bold shadow-[0_8px_20px_-6px_rgba(147,51,234,0.5)]" 
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <span className="truncate flex-1 text-left">{option.label}</span>
                      {String(value) === String(option.value) && (
                        <motion.svg 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-4 h-4 text-white ml-3 shrink-0" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
        
        {/* Hidden native select for form support */}
        <select ref={ref} value={value} onChange={onChange} className="hidden" {...props}>
          {children}
        </select>
      </div>
    );
  }
);
Select.displayName = "Select";

// Skeleton Component
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/5", className)}
      {...props}
    />
  );
}

// Card Components
export function Card({ className, children, hover = true }: { className?: string, children: React.ReactNode, hover?: boolean }) {
  return (
    <div className={cn(
      "bg-[#121212]/50 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300",
      hover && "hover:border-purple-500/20 hover:shadow-purple-500/5 hover:-translate-y-1",
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn("px-8 py-6 border-b border-white/5 bg-white/[0.01]", className)}>{children}</div>;
}

export function CardContent({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn("p-8", className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn("px-8 py-6 border-t border-white/5 bg-white/[0.01]", className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string, children: React.ReactNode }) {
  return <h3 className={cn("text-xl font-bold tracking-tight text-white", className)}>{children}</h3>;
}

export function CardDescription({ className, children }: { className?: string, children: React.ReactNode }) {
  return <p className={cn("text-sm text-gray-400 mt-1", className)}>{children}</p>;
}

// Separator Component
export function Separator({ className, orientation = "horizontal" }: { className?: string, orientation?: "horizontal" | "vertical" }) {
  return (
    <div className={cn(
      "shrink-0 bg-white/10",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )} />
  );
}

// Tabs Components
interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

export function Tabs({ 
  defaultValue, 
  className, 
  children,
  onValueChange 
}: { 
  defaultValue: string; 
  className?: string; 
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
}) {
  const [value, setValue] = React.useState(defaultValue);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn("space-y-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("inline-flex h-14 items-center justify-start rounded-2xl bg-white/5 p-1.5 text-gray-400 border border-white/5 backdrop-blur-sm", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const context = React.useContext(TabsContext);
  const isActive = context?.value === value;

  return (
    <button
      onClick={() => context?.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-semibold tracking-tight transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        isActive 
          ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]" 
          : "hover:bg-white/5 hover:text-white text-gray-400",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const context = React.useContext(TabsContext);
  if (context?.value !== value) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("mt-2 outline-none", className)}
    >
      {children}
    </motion.div>
  );
}

// Avatar Components
export function Avatar({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("relative flex h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-lg", className)}>
      {children}
    </div>
  );
}

export function AvatarImage({ src, className }: { src?: string | null, className?: string }) {
  if (!src) return null;
  return <img src={src} className={cn("aspect-square h-full w-full object-cover transition-transform hover:scale-110 duration-500", className)} />;
}

export function AvatarFallback({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("flex h-full w-full items-center justify-center rounded-2xl bg-white/5 text-sm font-semibold text-purple-400 uppercase", className)}>
      {children}
    </div>
  );
}

// Modal Component (using Framer Motion)
export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  className 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title?: string; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden",
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold tracking-tight text-white">{title}</h3>
                <button 
                  onClick={onClose}
                  className="p-3 hover:bg-white/5 rounded-2xl transition-colors group"
                >
                  <svg className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Table Wrapper Component for consistency
export function TableWrapper({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("bg-[#121212]/50 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl", className)}>
      <div className="overflow-x-auto no-scrollbar">
        {children}
      </div>
    </div>
  );
}

// Dropdown Menu Components
interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(undefined);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left" ref={containerRef}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) {
  const context = React.useContext(DropdownContext);
  if (!context) return null;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        context.setIsOpen(!context.isOpen);
      }
    });
  }

  return (
    <button onClick={() => context.setIsOpen(!context.isOpen)} className="focus:outline-none">
      {children}
    </button>
  );
}

export function DropdownMenuContent({ children, align = "right", className }: { children: React.ReactNode, align?: "left" | "right", className?: string }) {
  const context = React.useContext(DropdownContext);
  if (!context) return null;

  return (
    <AnimatePresence>
      {context.isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 8 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className={cn(
            "absolute z-[100] mt-2 w-56 overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0a0a0a]/98 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-1.5",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DropdownMenuItem({ children, onClick, className, variant = "default" }: { children: React.ReactNode, onClick?: () => void, className?: string, variant?: "default" | "destructive" }) {
  const context = React.useContext(DropdownContext);
  if (!context) return null;

  return (
    <button
      onClick={() => {
        onClick?.();
        context.setIsOpen(false);
      }}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all mb-0.5 last:mb-0",
        variant === "destructive" 
          ? "text-red-400 hover:bg-red-500/10" 
          : "text-gray-400 hover:bg-white/5 hover:text-white",
        className
      )}
    >
      {children}
    </button>
  );
}
