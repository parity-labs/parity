"use client";

import { TrendingUp } from "lucide-react";
import React from "react";
import { Bar, BarChart, XAxis } from "recharts";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chartData = [
  { month: "January", desktop: 342, mobile: 245, tablet: 123 },
  { month: "February", desktop: 876, mobile: 654, tablet: 234 },
  { month: "March", desktop: 512, mobile: 387, tablet: 156 },
  { month: "April", desktop: 629, mobile: 521, tablet: 267 },
  { month: "May", desktop: 458, mobile: 412, tablet: 213 },
  { month: "June", desktop: 781, mobile: 598, tablet: 321 },
  { month: "July", desktop: 394, mobile: 312, tablet: 145 },
  { month: "August", desktop: 925, mobile: 743, tablet: 150 },
  { month: "September", desktop: 647, mobile: 489, tablet: 212 },
  { month: "October", desktop: 532, mobile: 476, tablet: 187 },
  { month: "November", desktop: 803, mobile: 687, tablet: 298 },
  { month: "December", desktop: 271, mobile: 198, tablet: 123 },
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
  tablet: {
    label: "Tablet",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

type ActiveProperty = keyof typeof chartConfig | "all";

export function GlowingBarChart() {
  const [activeProperty, setActiveProperty] =
    React.useState<ActiveProperty>("all");

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row justify-between">
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
          <Select
            onValueChange={(value: ActiveProperty) => {
              setActiveProperty(value);
            }}
            value={activeProperty}
          >
            <SelectTrigger className="!h-6 !px-1.5 text-xs">
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                <SelectLabel>Properties</SelectLabel>
                <SelectItem className="text-xs" value="all">
                  All
                </SelectItem>
                <SelectItem className="text-xs" value="desktop">
                  Desktop
                </SelectItem>
                <SelectItem className="text-xs" value="mobile">
                  Mobile
                </SelectItem>
                <SelectItem className="text-xs" value="tablet">
                  Tablet
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>January - June 2025</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
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
            <Bar
              background={{ fill: "currentColor", radius: 4 }}
              barSize={8}
              className="text-[#E4E4E7] dark:text-[#1A1A1C]"
              dataKey="mobile"
              fill="var(--color-mobile)"
              overflow="visible"
              radius={4}
              shape={<CustomGradientBar activeProperty={activeProperty} />} // Only Top Bar will have background else it will give render errors
              stackId="a"
            />
            <Bar
              barSize={8}
              dataKey="tablet"
              fill="var(--color-tablet)"
              overflow="visible"
              radius={4}
              shape={<CustomGradientBar activeProperty={activeProperty} />}
              stackId="a"
            />
            <Bar
              barSize={8}
              dataKey="desktop"
              fill="var(--color-desktop)"
              overflow="visible"
              radius={4}
              shape={<CustomGradientBar activeProperty={activeProperty} />}
              stackId="a"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const CustomGradientBar = (
  props: React.SVGProps<SVGRectElement> & {
    dataKey?: string;
    activeProperty?: ActiveProperty | null;
    glowOpacity?: number;
  }
) => {
  const { fill, x, y, width, height, dataKey, activeProperty, radius } = props;

  const isActive = activeProperty === "all" ? true : activeProperty === dataKey;

  return (
    <>
      <rect
        fill={fill}
        filter={
          isActive && activeProperty !== "all"
            ? `url(#glow-chart-${dataKey})`
            : undefined
        }
        height={height}
        opacity={isActive ? 1 : 0.1}
        rx={radius}
        stroke="none"
        width={width}
        x={x}
        y={y}
      />
      <defs>
        <filter
          height="600%"
          id={`glow-chart-${dataKey}`}
          width="600%"
          x="-200%"
          y="-200%"
        >
          <feGaussianBlur result="blur" stdDeviation="10" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </>
  );
};
