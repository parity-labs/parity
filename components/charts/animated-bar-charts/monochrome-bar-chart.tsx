"use client";

import { TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { JetBrains_Mono } from "next/font/google";
import React, { type SVGProps } from "react";
import { Bar, BarChart, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
  { month: "January", desktop: 342 },
  { month: "February", desktop: 876 },
  { month: "March", desktop: 512 },
  { month: "April", desktop: 629 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--secondary-foreground)",
  },
} satisfies ChartConfig;

export function MonochromeBarChart() {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(
    undefined
  );

  const activeData = React.useMemo(() => {
    if (activeIndex === undefined) return null;
    return chartData[activeIndex];
  }, [activeIndex]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span
            className={cn(jetBrainsMono.className, "text-2xl tracking-tighter")}
          >
            ${activeData ? activeData.desktop : "123"}
          </span>
          <Badge variant="secondary">
            <TrendingUp className="h-4 w-4" />
            <span>5.2%</span>
          </Badge>
        </CardTitle>
        <CardDescription>vs. last quarter</CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              <XAxis
                axisLine={false}
                dataKey="month"
                tickFormatter={(value) => value.slice(0, 3)}
                tickLine={false}
                tickMargin={10}
              />
              <Bar
                dataKey="desktop"
                fill="var(--secondary-foreground)"
                shape={
                  <CustomBar
                    activeIndex={activeIndex}
                    setActiveIndex={setActiveIndex}
                  />
                }
              />
            </BarChart>
          </ChartContainer>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

interface CustomBarProps extends SVGProps<SVGSVGElement> {
  setActiveIndex: (index?: number) => void;
  index?: number;
  activeIndex?: number;
  value?: string;
}

const CustomBar = (props: CustomBarProps) => {
  const { fill, x, y, width, height, index, activeIndex, value } = props;

  // Custom variables
  const xPos = Number(x || 0);
  const realWidth = Number(width || 0);
  const isActive = index === activeIndex;
  const collapsedWidth = 2;
  // centered bar x-position
  const barX = isActive ? xPos : xPos + (realWidth - collapsedWidth) / 2;
  // centered text x-position
  const textX = xPos + realWidth / 2;
  // Custom bar shape
  return (
    <g onMouseEnter={() => props.setActiveIndex(index)}>
      {/* rendering the bar with custom postion and animated width */}
      <motion.rect
        animate={{ width: isActive ? realWidth : collapsedWidth, x: barX }}
        fill={fill}
        height={height}
        initial={{ width: collapsedWidth, x: barX }}
        style={{
          willChange: "transform, width", // helps with performance
        }}
        transition={{
          duration: activeIndex === index ? 0.5 : 1,
          type: "spring",
        }}
        y={y}
      />
      {/* Render value text on top of bar */}
      {isActive && (
        <motion.text
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          className={jetBrainsMono.className}
          exit={{ opacity: 0, y: -10, filter: "blur(3px)" }}
          fill={fill}
          initial={{ opacity: 0, y: -10, filter: "blur(3px)" }}
          key={index}
          style={{
            willChange: "transform, opacity", // helps with performance
          }}
          textAnchor="middle"
          transition={{ duration: 0.1 }}
          x={textX}
          y={Number(y) - 5}
        >
          {value}
        </motion.text>
      )}
    </g>
  );
};
