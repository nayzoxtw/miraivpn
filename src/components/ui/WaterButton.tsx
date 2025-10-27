import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const waterButtonVariants = cva(
  // ↓ centre V/H + dimension cohérente
  "btn btn-water inline-flex items-center justify-center text-center select-none",
  {
    variants: {
      variant: {
        primary: "bg-white text-black hover:bg-neutral-200 active:bg-neutral-300",
        ghost: "bg-white/5 text-white hover:bg-white/10",
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      full: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      full: false,
    },
  }
);

export interface WaterButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof waterButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const WaterButton = React.forwardRef<HTMLButtonElement, WaterButtonProps>(
  ({ className, variant, size, full, asChild = false, loading, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          waterButtonVariants({ variant, size, full, className }),
          "rounded-full font-medium relative z-0 transition-colors duration-200",
          props.disabled && "opacity-60 pointer-events-none",
          loading && "opacity-70 pointer-events-none"
        )}
        ref={ref}
        {...props}
      >
        <span className="relative z-10 inline-flex items-center justify-center w-full">
          {props.children}
        </span>
      </Comp>
    );
  }
);
WaterButton.displayName = "WaterButton";

export { WaterButton, waterButtonVariants };
