import type React from "react";
import { cn } from "@/lib/utils";

const DisplayChartContainer = ({
  count = 2,
  className,
  children,
}: {
  count?: number;
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-[repeat(var(--chart-count),minmax(0,1fr))]",
        className
      )}
      style={
        {
          "--chart-count": count,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
};

export default DisplayChartContainer;
