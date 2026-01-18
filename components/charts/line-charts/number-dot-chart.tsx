"use client";

import { TrendingDown } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
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
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function NumberDotLineChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Number Dot Chart
          <Badge
            className="ml-2 border-none bg-red-500/10 text-red-500"
            variant="outline"
          >
            <TrendingDown className="h-4 w-4" />
            <span>-5.2%</span>
          </Badge>
        </CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickFormatter={(value) => value.slice(0, 3)}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={false}
              cursorStyle={{}}
            />
            <Line
              activeDot={() => <></>}
              dataKey="desktop"
              dot={<CustomizedDot />}
              stroke="var(--color-desktop)"
              strokeDasharray="4 4"
              type="linear"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const CustomizedDot = (
  props: React.SVGProps<SVGCircleElement> & { value?: number }
) => {
  const { cx, cy, stroke, value } = props;

  return (
    <g>
      {/* Main dot */}
      <circle cx={cx} cy={cy} fill={stroke} r={9} />
      <text
        className="text-white dark:text-black"
        dy={8}
        fill="currentColor"
        fontSize={8}
        fontWeight={600}
        textAnchor="middle"
        transform="translate(0, -5)"
        x={cx}
        y={cy}
      >
        {value?.toString()}
      </text>
    </g>
  );
};
