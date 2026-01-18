import type React from "react";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/ui/code-block/copy-button";
import { cn } from "@/lib/utils";
import { ChartCodeSheet } from "./chart-code-sheet";

interface ChartDisplayProps {
  name: string;
  children: React.ReactNode;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonContent?: any;
}

const ChartDisplay = ({
  name,
  children,
  className,
  jsonContent,
}: ChartDisplayProps) => {
  const code = jsonContent?.files[0].content;
  const fileName = jsonContent?.name;

  // if things are not present just dont showwwwe eeee yes lesgo
  if (!(code && fileName)) {
    return null;
  }

  return (
    <div
      className={cn(
        "group rounded-[14px] bg-border/40 p-1 dark:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between py-1 pr-2 pb-1.5 pl-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-muted-foreground text-xs leading-none">
            {name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton code={code} />
          <ChartCodeSheet code={code} name={fileName}>
            <Button className="h-6 px-2 text-[11px]" variant="outline">
              npx shadcn add
            </Button>
          </ChartCodeSheet>
        </div>
      </div>
      {children}
    </div>
  );
};

export default ChartDisplay;
