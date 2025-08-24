"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { BRAND_CONFIG } from "@/lib/brand"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

const gridColor = BRAND_CONFIG.charts.gridColor;
const tickColor = BRAND_CONFIG.charts.tickColor;
const fontFamily = BRAND_CONFIG.charts.fontFamily;

export function LineChart(props: {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
    fill?: boolean;
  }>;
  height?: number;
}) {
  const datasets = props.datasets.map((d, idx) => {
    const baseColor =
      d.color || Object.values(BRAND_CONFIG.charts.palette)[idx % 6];
    const withAlpha = (hex: string, alpha: number) => {
      // simple hex to rgba fallback; expect hex like #RRGGBB
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    return {
      label: d.label,
      data: d.data,
      borderColor: baseColor,
      backgroundColor: withAlpha(baseColor, 0.25),
      pointRadius: 0,
      tension: 0.3,
      fill: d.fill ?? true,
    };
  });

  return (
    <Line
      height={props.height}
      data={{ labels: props.labels, datasets }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: BRAND_CONFIG.charts.tooltipBg,
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: BRAND_CONFIG.charts.tooltipBorder,
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: tickColor, font: { family: fontFamily } },
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: tickColor, font: { family: fontFamily } },
          },
        },
      }}
    />
  );
}

export function DoughnutChart(props: {
  labels: string[];
  values: number[];
  colors?: string[];
  cutout?: string | number;
}) {
  const colors =
    props.colors && props.colors.length > 0
      ? props.colors
      : Object.values(BRAND_CONFIG.charts.palette);
  return (
    <Doughnut
      data={{
        labels: props.labels,
        datasets: [
          {
            data: props.values,
            backgroundColor: props.values.map(
              (_, i) => colors[i % colors.length]
            ),
          },
        ],
      }}
      options={{
        cutout: props.cutout ?? "60%",
        plugins: { legend: { display: false } },
      }}
    />
  );
}

export function BarChartJS(props: {
  labels: string[];
  values: number[];
  color?: string;
}) {
  const color = props.color || BRAND_CONFIG.charts.palette.primary;
  return (
    <Bar
      data={{
        labels: props.labels,
        datasets: [{ data: props.values, backgroundColor: color }],
      }}
      options={{
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: tickColor } },
          y: { grid: { color: gridColor }, ticks: { color: tickColor } },
        },
      }}
    />
  );
}
