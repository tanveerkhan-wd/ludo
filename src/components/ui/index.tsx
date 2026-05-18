import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Badge Component
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'text-foreground border border-input hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
    success: 'bg-green-500/10 text-green-500 border border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-white text-black hover:bg-white/90',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
      outline: 'border border-white/10 bg-transparent hover:bg-white/5 text-white',
      secondary: 'bg-white/10 text-white hover:bg-white/20',
      ghost: 'hover:bg-white/5 text-white',
      link: 'text-white underline-offset-4 hover:underline',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
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
          "flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
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
            "flex h-12 w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-2 pr-10 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all appearance-none cursor-pointer",
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

// Separator Component
export function Separator({ className }: { className?: string }) {
  return <div className={cn("shrink-0 bg-white/10 h-[1px] w-full", className)} />;
}

// Card Components
export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("bg-[#121212] border border-white/5 rounded-3xl overflow-hidden shadow-xl", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn("px-6 py-4 border-b border-white/5 bg-white/[0.01]", className)}>{children}</div>;
}

export function CardContent({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn("px-6 py-4 border-t border-white/5 bg-white/[0.01]", className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string, children: React.ReactNode }) {
  return <h3 className={cn("text-lg font-bold tracking-tight", className)}>{children}</h3>;
}

export function CardDescription({ className, children }: { className?: string, children: React.ReactNode }) {
  return <p className={cn("text-sm text-gray-400", className)}>{children}</p>;
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
    <div className={cn("inline-flex h-12 items-center justify-start rounded-2xl bg-white/5 p-1 text-gray-400 border border-white/5", className)}>
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
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive 
          ? "bg-purple-600 text-white shadow-lg" 
          : "hover:bg-white/5 hover:text-white",
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
  return <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>{children}</div>;
}

// Avatar Components
export function Avatar({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10", className)}>
      {children}
    </div>
  );
}

export function AvatarImage({ src, className }: { src?: string | null, className?: string }) {
  if (!src) return null;
  return <img src={src} className={cn("aspect-square h-full w-full object-cover", className)} />;
}

export function AvatarFallback({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-white/5 text-sm font-bold text-purple-400", className)}>
      {children}
    </div>
  );
}

// Modal Component (using Framer Motion)
import { motion, AnimatePresence } from "framer-motion";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={cn(
              "relative w-full max-w-lg bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden",
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{title}</h3>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
