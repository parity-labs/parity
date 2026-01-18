"use client";

import { TrendingUp } from "lucide-react";
import React from "react";
import { Bar, BarChart, Cell, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "January", desktop: 342 },
  { month: "February", desktop: 876 },
  { month: "March", desktop: 512 },
  { month: "April", desktop: 629 },
  { month: "May", desktop: 458 },
  { month: "June", desktop: 781 },
  { month: "July", desktop: 394 },
  { month: "August", desktop: 925 },
  { month: "September", desktop: 647 },
  { month: "October", desktop: 532 },
  { month: "November", desktop: 803 },
  { month: "December", desktop: 271 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function HighlightedBarChart() {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const activeData = React.useMemo(() => {
    if (activeIndex === null) return null;
    return chartData[activeIndex];
  }, [activeIndex]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Bar Chart
          <Badge
            className="ml-2 border-none bg-green-500/10 text-green-500"
            variant="outline"
          >
            <TrendingUp className="h-4 w-4" />
            <span>5.2%</span>
          </Badge>
        </CardTitle>
        <CardDescription>
          {activeData
            ? `${activeData.month}: ${activeData.desktop}`
            : "January - June 2025"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <rect
              fill="url(#highlighted-pattern-dots)"
              height="85%"
              width="100%"
              x="0"
              y="0"
            />
            <defs>
              <DottedBackgroundPattern />
            </defs>
            <XAxis
              axisLine={false}
              dataKey="month"
              tickFormatter={(value) => value.slice(0, 3)}
              tickLine={false}
              tickMargin={10}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={false}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4}>
              {chartData.map((_, index) => (
                <Cell
                  className="duration-200"
                  fillOpacity={
                    activeIndex === null ? 1 : activeIndex === index ? 1 : 0.3
                  }
                  key={`cell-${index}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  stroke={activeIndex === index ? "var(--color-desktop)" : ""}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const DottedBackgroundPattern = () => {
  return (
    <pattern
      height="10"
      id="highlighted-pattern-dots"
      patternUnits="userSpaceOnUse"
      width="10"
      x="0"
      y="0"
    >
      <circle
        className="text-muted dark:text-muted/40"
        cx="2"
        cy="2"
        fill="currentColor"
        r="1"
      />
    </pattern>
  );
};
