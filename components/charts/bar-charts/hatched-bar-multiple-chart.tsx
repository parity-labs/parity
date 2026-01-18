"use client";

import { TrendingDown } from "lucide-react";
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

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
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

export function HatchedBarMultipleChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Bar Chart - Multiple
          <Badge
            className="ml-2 border-none bg-red-500/10 text-red-500"
            variant="outline"
          >
            <TrendingDown className="h-4 w-4" />
            <span>-5.2%</span>
          </Badge>
        </CardTitle>
        <CardDescription>January - June 2025</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <rect
              fill="url(#default-multiple-pattern-dots)"
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
              content={<ChartTooltipContent hideLabel indicator="dashed" />}
              cursor={false}
            />
            <Bar
              color="var(--chart-1)"
              dataKey="desktop"
              fill="var(--color-desktop)"
              radius={4}
              shape={<CustomHatchedBar isHatched={false} />}
            />
            <Bar
              dataKey="mobile"
              fill="var(--color-mobile)"
              radius={4}
              shape={<CustomHatchedBar />}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const CustomHatchedBar = (
  props: React.SVGProps<SVGRectElement> & {
    dataKey?: string;
    isHatched?: boolean;
  }
) => {
  const { fill, x, y, width, height, dataKey } = props;

  const isHatched = props.isHatched ?? true;

  return (
    <>
      <rect
        fill={isHatched ? `url(#hatched-bar-pattern-${dataKey})` : fill}
        height={height}
        rx={4}
        stroke="none"
        width={width}
        x={x}
        y={y}
      />
      <defs>
        <pattern
          height="5"
          id={`hatched-bar-pattern-${dataKey}`}
          key={dataKey}
          patternTransform="rotate(-45)"
          patternUnits="userSpaceOnUse"
          width="5"
          x="0"
          y="0"
        >
          <rect fill={fill} height="10" opacity={0.5} width="10" />
          <rect fill={fill} height="10" width="1" />
        </pattern>
      </defs>
    </>
  );
};
const DottedBackgroundPattern = () => {
  return (
    <pattern
      height="10"
      id="default-multiple-pattern-dots"
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
