import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Badge Component
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info' | 'premium';
  glow?: boolean;
}

export function Badge({ className, variant = 'default', glow = false, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'text-foreground border border-white/10 hover:bg-white/5',
    destructive: 'bg-red-500/10 text-red-500 border border-red-500/20',
    success: 'bg-green-500/10 text-green-500 border border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
    info: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    premium: 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        glow && "animate-pulse shadow-[0_0_10px_currentColor]",
        className
      )}
      {...props}
    />
  );
}

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'premium';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-white text-black hover:bg-white/90 shadow-[0_4px_14px_0_rgba(255,255,255,0.39)]',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-[0_4px_14px_0_rgba(239,68,68,0.39)]',
      outline: 'border border-white/10 bg-transparent hover:bg-white/5 text-white',
      secondary: 'bg-white/10 text-white hover:bg-white/20',
      ghost: 'hover:bg-white/5 text-white',
      link: 'text-white underline-offset-4 hover:underline',
      premium: 'bg-gradient-to-r from-purple-600 to-red-600 text-white border-none shadow-[0_4px_14px_0_rgba(168,85,247,0.39)] hover:scale-[1.02] active:scale-[0.98]',
    };

    const sizes = {
      default: 'h-10 px-5 py-2',
      sm: 'h-9 rounded-xl px-3 text-xs',
      lg: 'h-12 rounded-2xl px-8 text-base',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Input Component
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-white/[0.08]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// Select Component
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-12 w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-2 pr-10 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all appearance-none cursor-pointer hover:bg-white/5",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
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
