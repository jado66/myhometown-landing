import { cn } from "@/lib/utils";
import React from "react";

const base = "max-w-7xl mx-auto shadow-lg";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({
  className = "",
  children,
  ...rest
}) => {
  return (
    <div className={cn(base, className)} {...rest}>
      {children}
    </div>
  );
};

export default Container;
