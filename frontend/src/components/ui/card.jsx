import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-lg border shadow-sm", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground",
      blue: "bg-gradient-to-br from-white to-blue-50 border-blue-100",
      primary: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      destructive: "bg-destructive text-destructive-foreground",
      ghost: "border-none shadow-none bg-transparent",
      gradient: "bg-gradient-to-r from-blue-600 to-blue-400 text-white border-none",
    },
    effect: {
      none: "",
      hover: "transition-all duration-300 hover:shadow-md hover:-translate-y-1",
      "3d": "card-3d transition-all duration-300",
      glow: "hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300",
    },
    size: {
      default: "p-6",
      sm: "p-4",
      lg: "p-8",
      xl: "p-10",
    },
  },
  defaultVariants: {
    variant: "default",
    effect: "none",
    size: "default",
  },
});

const Card = React.forwardRef(({ className, variant, effect, size, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, effect, size, className }))}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
});
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  );
});
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter";

const CardIcon = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center rounded-full p-3", className)}
      {...props}
    />
  );
});
CardIcon.displayName = "CardIcon";

const CardStat = React.forwardRef(({ className, value, label, icon, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      <div>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </div>
      {icon && <CardIcon className="bg-blue-100">{icon}</CardIcon>}
    </div>
  );
});
CardStat.displayName = "CardStat";

const CardProgress = React.forwardRef(({ 
  className, 
  value, 
  label, 
  max = 100, 
  showValue = true, 
  color = "bg-blue-600", 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        {showValue && <span className="text-sm font-medium">{value}%</span>}
      </div>
      <div className="w-full bg-blue-100 rounded-full h-2.5">
        <div 
          className={`${color} h-2.5 rounded-full`} 
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );
});
CardProgress.displayName = "CardProgress";

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardIcon,
  CardStat,
  CardProgress
};