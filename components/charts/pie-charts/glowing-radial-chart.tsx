"use client";
import React from "react";
import { Cell, RadialBar, RadialBarChart } from "recharts";
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
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

type ActiveBrowser = keyof typeof chartConfig | "all" | null;

export function GlowingRadialChart() {
  const [activeBrowser, setActiveBrowser] = React.useState<ActiveBrowser>(null);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Glowing Radial Chart</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          className="mx-auto aspect-square max-h-[250px]"
          config={chartConfig}
        >
          <RadialBarChart
            data={chartData}
            innerRadius={30}
            onMouseLeave={() => setActiveBrowser(null)}
            onMouseMove={(data) => {
              if (data && data.activePayload && data.activePayload[0]) {
                setActiveBrowser(data.activePayload[0].payload.browser);
              }
            }}
            outerRadius={110}
          >
            <ChartTooltip
              content={<ChartTooltipContent hideLabel nameKey="browser" />}
              cursor={false}
            />
            <RadialBar
              background
              className="drop-shadow-lg"
              cornerRadius={10}
              dataKey="visitors"
            >
              {chartData.map((entry, index) => (
                <Cell
                  fill={entry.fill}
                  filter={
                    activeBrowser === entry.browser
                      ? `url(#radial-glow-${entry.browser})`
                      : undefined
                  }
                  key={`cell-${index}`}
                  opacity={
                    activeBrowser === null || activeBrowser === entry.browser
                      ? 1
                      : 0.3
                  }
                />
              ))}
            </RadialBar>
            <defs>
              {chartData.map((entry) => (
                <filter
                  height="200%"
                  id={`radial-glow-${entry.browser}`}
                  key={`filter-${entry.browser}`}
                  width="200%"
                  x="-50%"
                  y="-50%"
                >
                  <feGaussianBlur result="blur" stdDeviation="8" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              ))}
            </defs>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
