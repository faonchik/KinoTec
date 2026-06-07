import { forwardRef } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, className = "", children, disabled, ...props }, ref) => {
    const variants = {
      primary: "rounded-sm bg-[#e50914] font-semibold text-white shadow-[0_8px_24px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:shadow-[0_10px_28px_rgba(229,9,20,0.45)] ring-1 ring-white/10",
      secondary: "rounded-sm border border-white/[0.15] bg-white/[0.08] text-white hover:bg-white/[0.12]",
      danger: "bg-red-600 text-white hover:bg-red-700 rounded-sm",
      ghost: "rounded-sm bg-transparent text-white/70 hover:bg-white/[0.08] hover:text-white",
      outline: "rounded-sm border-2 border-white/40 text-white hover:bg-white/10",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2 font-medium rounded-lg
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#e50914]/50 focus:ring-offset-2 focus:ring-offset-[#141414]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="flex-shrink-0">
            <LoadingSpinner size="sm" />
          </div>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

