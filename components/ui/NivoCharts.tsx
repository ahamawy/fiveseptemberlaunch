"use client";

import React from "react";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { BRAND_CONFIG } from "@/lib/brand"

const chartTheme = {
  background: "transparent",
  textColor: BRAND_CONFIG.charts.tickColor,
  fontFamily: BRAND_CONFIG.charts.fontFamily,
  axis: {
    domain: { line: { stroke: BRAND_CONFIG.charts.gridColor } },
    ticks: {
      line: { stroke: BRAND_CONFIG.charts.gridColor },
      text: { fill: BRAND_CONFIG.charts.tickColor },
    },
    legend: { text: { fill: BRAND_CONFIG.charts.tickColor } },
  },
  grid: { line: { stroke: BRAND_CONFIG.charts.gridColor } },
  legends: { text: { fill: BRAND_CONFIG.charts.tickColor } },
  tooltip: {
    container: {
      background: BRAND_CONFIG.charts.tooltipBg,
      color: "#fff",
      border: BRAND_CONFIG.charts.tooltipBorder,
      fontFamily: BRAND_CONFIG.charts.fontFamily,
    },
  },
} as const;

export function NivoLine(
  props: {
    series: Array<{ id: string; data: Array<{ x: string | number; y: number }> }>;
    height?: number | string;
  }
) {
  return (
    <div style={{ height: props.height ?? 300 }}>
      <ResponsiveLine
        data={props.series}
        theme={chartTheme as any}
        colors={[BRAND_CONFIG.charts.palette.primary, BRAND_CONFIG.charts.palette.accent] as any}
        margin={{ top: 10, right: 20, bottom: 40, left: 50 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", stacked: false, min: "auto", max: "auto" }}
        enablePoints={false}
        useMesh={true}
        axisBottom={{ tickRotation: -35 }}
        gridYValues={5}
        curve="monotoneX"
      />
    </div>
  );
}

export function NivoPie(
  props: { data: Array<{ id: string; value: number }>; height?: number | string }
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
    <div style={{ height: props.height ?? 280 }}>
      <ResponsivePie
        data={props.data}
        theme={chartTheme as any}
        colors={colors as any}
        innerRadius={0.6}
        padAngle={1}
        cornerRadius={2}
        enableArcLabels={false}
        enableArcLinkLabels={false}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
      />
    </div>
  );
}

export function NivoBar(
  props: {
    labels: string[];
    values: number[];
    height?: number | string;
  }
) {
  const data = props.labels.map((label, i) => ({ label, value: props.values[i] || 0 }));
  return (
    <div style={{ height: props.height ?? 300 }}>
      <ResponsiveBar
        data={data}
        keys={["value"]}
        indexBy="label"
        theme={chartTheme as any}
        colors={[BRAND_CONFIG.charts.palette.primary] as any}
        margin={{ top: 10, right: 20, bottom: 50, left: 60 }}
        padding={0.3}
        axisBottom={{ tickRotation: -35 }}
        axisLeft={{}}
        enableLabel={false}
        gridYValues={5}
      />
    </div>
  );
}


