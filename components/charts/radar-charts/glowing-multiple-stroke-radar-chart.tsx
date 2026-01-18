"use client";

import { TrendingDown } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
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
  { month: "January", desktop: 186, mobile: 92 },
  { month: "February", desktop: 305, mobile: 178 },
  { month: "March", desktop: 237, mobile: 145 },
  { month: "April", desktop: 273, mobile: 203 },
  { month: "May", desktop: 209, mobile: 167 },
  { month: "June", desktop: 298, mobile: 132 },
  { month: "July", desktop: 245, mobile: 189 },
  { month: "August", desktop: 312, mobile: 156 },
  { month: "September", desktop: 187, mobile: 210 },
  { month: "October", desktop: 263, mobile: 124 },
  { month: "November", desktop: 229, mobile: 198 },
  { month: "December", desktop: 276, mobile: 172 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function GlowingMultipleStrokeRadarChart() {
  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>
          Glowing Multiple Stroke
          <Badge
            className="ml-2 border-none bg-red-500/10 text-red-500"
            variant="outline"
          >
            <TrendingDown className="h-4 w-4" />
            <span>5.2%</span>
          </Badge>
        </CardTitle>
        <CardDescription>
          Showing total visitors for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          className="mx-auto aspect-square max-h-[250px]"
          config={chartConfig}
        >
          <RadarChart data={chartData}>
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <PolarAngleAxis dataKey="month" />
            <PolarGrid strokeDasharray="3 3" />
            <Radar
              dataKey="desktop"
              fill="none"
              filter="url(#multi-stroke-line-glow)"
              stroke="var(--color-desktop)"
            />
            <Radar
              dataKey="mobile"
              fill="none"
              filter="url(#multi-stroke-line-glow)"
              stroke="var(--color-mobile)"
            />
            <defs>
              <filter
                height="140%"
                id="multi-stroke-line-glow"
                width="140%"
                x="-20%"
                y="-20%"
              >
                <feGaussianBlur result="blur" stdDeviation="10" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
