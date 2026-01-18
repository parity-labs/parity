"use client";

import { TrendingDown } from "lucide-react";
import { useMotionValueEvent, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartData = [
  { month: "January", mobile: 245 },
  { month: "February", mobile: 654 },
  { month: "March", mobile: 387 },
  { month: "April", mobile: 521 },
  { month: "May", mobile: 412 },
  { month: "June", mobile: 598 },
  { month: "July", mobile: 312 },
  { month: "August", mobile: 743 },
  { month: "September", mobile: 489 },
  { month: "October", mobile: 476 },
  { month: "November", mobile: 687 },
  { month: "December", mobile: 198 },
];

const chartConfig = {
  mobile: {
    label: "Mobile",
    color: "#FCA070",
  },
} satisfies ChartConfig;

export function ClippedAreaChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [axis, setAxis] = useState(0);

  // motion values
  const springX = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });
  const springY = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });

  useMotionValueEvent(springX, "change", (latest) => {
    setAxis(latest);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          ${springY.get().toFixed(0)}
          <Badge className="ml-2" variant="secondary">
            <TrendingDown className="h-4 w-4" />
            <span>-5.2%</span>
          </Badge>
        </CardTitle>
        <CardDescription>Total revenue for last year</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="h-54 w-full"
          config={chartConfig}
          ref={chartRef}
        >
          <AreaChart
            accessibilityLayer
            className="overflow-visible"
            data={chartData}
            margin={{
              right: 0,
              left: 0,
            }}
            onMouseLeave={() => {
              springX.set(chartRef.current?.getBoundingClientRect().width || 0);
              springY.jump(chartData[chartData.length - 1].mobile);
            }}
            onMouseMove={(state) => {
              const x = state.activeCoordinate?.x;
              const dataValue = state.activePayload?.[0]?.value;
              if (x && dataValue !== undefined) {
                springX.set(x);
                springY.set(dataValue);
              }
            }}
          >
            <CartesianGrid
              horizontalCoordinatesGenerator={(props) => {
                const { height } = props;
                return [0, height - 30];
              }}
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickFormatter={(value) => value.slice(0, 3)}
              tickLine={false}
              tickMargin={8}
            />
            <Area
              clipPath={`inset(0 ${
                Number(chartRef.current?.getBoundingClientRect().width) - axis
              } 0 0)`}
              dataKey="mobile"
              fill="url(#gradient-cliped-area-mobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              type="monotone"
            />
            <line
              stroke="var(--color-mobile)"
              strokeDasharray="3 3"
              strokeLinecap="round"
              strokeOpacity={0.2}
              x1={axis}
              x2={axis}
              y1={0}
              y2={"85%"}
            />
            <rect
              fill="var(--color-mobile)"
              height={18}
              width={50}
              x={axis - 50}
              y={0}
            />
            <text
              fill="var(--primary-foreground)"
              fontWeight={600}
              textAnchor="middle"
              x={axis - 25}
              y={13}
            >
              ${springY.get().toFixed(0)}
            </text>
            {/* this is a ghost line behind graph */}
            <Area
              dataKey="mobile"
              fill="none"
              stroke="var(--color-mobile)"
              strokeOpacity={0.1}
              type="monotone"
            />
            <defs>
              <linearGradient
                id="gradient-cliped-area-mobile"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0}
                />
                <mask id="mask-cliped-area-chart">
                  <rect
                    fill="white"
                    height={"100%"}
                    width={"50%"}
                    x={0}
                    y={0}
                  />
                </mask>
              </linearGradient>
            </defs>
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
