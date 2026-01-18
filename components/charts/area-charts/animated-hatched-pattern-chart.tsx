"use client";

import { TrendingUp } from "lucide-react";
import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
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
  { month: "January", desktop: 342, mobile: 245 },
  { month: "February", desktop: 876, mobile: 654 },
  { month: "March", desktop: 512, mobile: 387 },
  { month: "April", desktop: 629, mobile: 521 },
  { month: "May", desktop: 458, mobile: 412 },
  { month: "June", desktop: 781, mobile: 598 },
  { month: "July", desktop: 394, mobile: 312 },
  { month: "August", desktop: 925, mobile: 743 },
  { month: "September", desktop: 647, mobile: 489 },
  { month: "October", desktop: 532, mobile: 476 },
  { month: "November", desktop: 803, mobile: 687 },
  { month: "December", desktop: 271, mobile: 198 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type ActiveProperty = keyof typeof chartConfig;

export function AnimatedHatchedPatternAreaChart() {
  const [activeProperty, setActiveProperty] =
    React.useState<ActiveProperty | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Hatched Area Chart
          <Badge
            className="ml-2 border-none bg-green-500/10 text-green-500"
            variant="outline"
          >
            <TrendingUp className="h-4 w-4" />
            <span>5.2%</span>
          </Badge>
        </CardTitle>
        <CardDescription>
          Showing total visitors for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickFormatter={(value) => value.slice(0, 3)}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <defs>
              <HatchedBackgroundPattern config={chartConfig} />
              <linearGradient
                id="hatched-background-pattern-grad-desktop"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id="hatched-background-pattern-grad-mobile"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="mobile"
              fill={
                activeProperty === "mobile"
                  ? "url(#hatched-background-pattern-mobile)"
                  : "url(#hatched-background-pattern-grad-mobile)"
              }
              fillOpacity={0.4}
              onMouseEnter={() => setActiveProperty("mobile")}
              onMouseLeave={() => setActiveProperty(null)}
              stackId="a"
              stroke="var(--color-mobile)"
              strokeWidth={0.8}
              type="natural"
            />
            <Area
              dataKey="desktop"
              fill={
                activeProperty === "desktop"
                  ? "url(#hatched-background-pattern-desktop)"
                  : "url(#hatched-background-pattern-grad-desktop)"
              }
              fillOpacity={0.4}
              onMouseEnter={() => setActiveProperty("desktop")}
              onMouseLeave={() => setActiveProperty(null)}
              stackId="a"
              stroke="var(--color-desktop)"
              strokeWidth={0.8}
              type="natural"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const HatchedBackgroundPattern = ({ config }: { config: ChartConfig }) => {
  const items = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, value.color])
  );
  return (
    <>
      {Object.entries(items).map(([key, value]) => (
        <pattern
          height="6.81"
          id={`hatched-background-pattern-${key}`}
          key={key}
          overflow="visible"
          patternTransform="rotate(-45)"
          patternUnits="userSpaceOnUse"
          width="6.81"
          x="0"
          y="0"
        >
          <g className="will-change-transform" overflow="visible">
            <animateTransform
              attributeName="transform"
              dur="1s"
              from="0 0"
              repeatCount="indefinite"
              to="6 0"
              type="translate"
            />
            <rect fill={value} height="10" opacity={0.05} width="10" />
            <rect fill={value} height="10" width="1" />
          </g>
        </pattern>
      ))}
    </>
  );
};
