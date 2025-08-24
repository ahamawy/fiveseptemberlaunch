"use client";

import React from "react";
import { VictoryChart, VictoryLine, VictoryTheme, VictoryArea, VictoryPie, VictoryAxis } from "victory";
import { BRAND_CONFIG } from "@/lib/brand"

const victoryTheme = {
  ...VictoryTheme.material,
  axis: {
    ...VictoryTheme.material.axis,
    style: {
      axis: { stroke: BRAND_CONFIG.charts.gridColor },
      tickLabels: { fill: BRAND_CONFIG.charts.tickColor, fontFamily: BRAND_CONFIG.charts.fontFamily },
      grid: { stroke: BRAND_CONFIG.charts.gridColor, strokeDasharray: "4,4" },
    },
  },
} as any;

export function VictoryLineChart(
  props: { points: Array<{ x: string | number; y: number }>; height?: number }
) {
  const color = BRAND_CONFIG.charts.palette.primary;
  return (
    <VictoryChart theme={victoryTheme} height={props.height ?? 260} padding={{ top: 10, left: 60, right: 20, bottom: 40 }}>
      <VictoryAxis fixLabelOverlap style={{ grid: { stroke: BRAND_CONFIG.charts.gridColor } }} />
      <VictoryAxis dependentAxis style={{ grid: { stroke: BRAND_CONFIG.charts.gridColor } }} />
      <VictoryArea data={props.points} style={{ data: { fill: color + "55", stroke: color } }} interpolation="monotoneX" />
    </VictoryChart>
  );
}

export function VictoryPieChart(
  props: { data: Array<{ x: string; y: number }>; height?: number }
) {
  const colors = [
    BRAND_CONFIG.charts.palette.primary,
    BRAND_CONFIG.charts.palette.accent,
    BRAND_CONFIG.charts.palette.success,
    BRAND_CONFIG.charts.palette.info,
    BRAND_CONFIG.charts.palette.warning,
    BRAND_CONFIG.charts.palette.error,
  ];
  return (
    <VictoryPie
      height={props.height ?? 240}
      innerRadius={70}
      colorScale={colors as any}
      data={props.data}
      style={{ labels: { fill: BRAND_CONFIG.charts.tickColor, fontFamily: BRAND_CONFIG.charts.fontFamily } }}
      padding={{ top: 10, left: 10, right: 10, bottom: 10 }}
    />
  );
}


