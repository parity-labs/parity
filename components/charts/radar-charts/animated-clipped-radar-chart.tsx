"use client";
import { TrendingDown } from "lucide-react";
import { useMotionValueEvent, useSpring } from "motion/react";
import { useEffect, useState } from "react";
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
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 273 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#FCA070",
  },
} satisfies ChartConfig;

export function AnimatedClippedRadarChart() {
  const [currentAngle, setCurrentAngle] = useState(0);
  const [hoveredValue, setHoveredValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  const springAngle = useSpring(0, { damping: 30, stiffness: 100 });
  const springValue = useSpring(0, { damping: 30, stiffness: 100 });

  useMotionValueEvent(springAngle, "change", setCurrentAngle);
  useMotionValueEvent(springValue, "change", setHoveredValue);

  useEffect(() => {
    if (!hasAnimated) {
      springAngle.set(360);
      springValue.set(chartData[chartData.length - 1].desktop);
      setHasAnimated(true);
    }
  }, [hasAnimated, springAngle, springValue]);

  const centerX = 125;
  const centerY = 125;
  const radius = 120;
  const rad = (currentAngle - 90) * (Math.PI / 180);
  const x = centerX + radius * Math.cos(rad);
  const y = centerY + radius * Math.sin(rad);

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>
          {Math.round(hoveredValue)}
          <Badge className="ml-2" variant="secondary">
            <TrendingDown className="h-4 w-4" />
            <span>-5.2%</span>
          </Badge>
        </CardTitle>
        <CardDescription>
          Animated clipped radar chart - Total visitors for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          className="mx-auto aspect-square max-h-[250px]"
          config={chartConfig}
        >
          <RadarChart
            data={chartData}
            height={250}
            onMouseLeave={() => {
              springAngle.set(360);
              springValue.set(chartData[chartData.length - 1].desktop);
            }}
            onMouseMove={(state) => {
              if (state.activePayload && state.activePayload[0]) {
                const v = state.activePayload[0].value;
                const idx = state.activeTooltipIndex || 0;
                const a = (idx * 360) / chartData.length;
                springAngle.set(a);
                springValue.set(v);
              }
            }}
            width={250}
          >
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <PolarAngleAxis dataKey="month" />
            <PolarGrid strokeDasharray="3 3" />

            <defs>
              <clipPath id="clipped-sector">
                {currentAngle >= 360 ? (
                  <circle cx={centerX} cy={centerY} fill="white" r={radius} />
                ) : (
                  <path
                    d={`
                      M ${centerX} ${centerY}
                      L ${centerX} ${centerY - radius}
                      A ${radius} ${radius} 0 ${
                        currentAngle > 180 ? 1 : 0
                      } 1 ${x} ${y}
                      Z
                    `}
                    fill="white"
                  />
                )}
              </clipPath>

              <linearGradient
                id="gradient-clipped-radar-desktop"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={chartConfig.desktop.color}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.desktop.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <Radar
              clipPath="url(#clipped-sector)"
              dataKey="desktop"
              fill="url(#gradient-clipped-radar-desktop)"
              fillOpacity={0.4}
              stroke={chartConfig.desktop.color}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
