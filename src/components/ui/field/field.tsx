import * as React from "react";
import { Label } from "@/components/ui/label/label";
import { cn } from "@/lib/cn";

interface FieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  error?: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, required, error, hint, className, children }: FieldProps) {
  return (
    <div className={cn("field-stack", className)}>
      {label && (
        <Label htmlFor={htmlFor} className="block text-xs">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      {children}
      {error && <p className="text-[10px] text-destructive">{error}</p>}
      {!error && hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
