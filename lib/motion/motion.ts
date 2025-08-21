import motionCfg from "@/config/motion.json";

type VariantConfig = {
  initial?: Record<string, any>;
  animate?: Record<string, any>;
  transition?: Record<string, any>;
};

export function V(name?: string): Record<string, any> {
  const v: VariantConfig = (motionCfg as any).variants?.[name || ""] || {};
  const viewport = {
    once: (motionCfg as any).scroll?.viewportOnce ?? true,
    amount: (motionCfg as any).scroll?.amount ?? 0.2,
  };
  const initial = v.initial ?? { opacity: 0 };
  const whileInView = v.animate ?? { opacity: 1 };
  return { initial, whileInView, viewport };
}

export function micro(name?: string): Record<string, any> {
  const m = (motionCfg as any).micro?.[name || ""] || {};
  return m;
}

export function formatNumber(value: number, format?: string): string {
  // Very small formatter: $0,0a, 0+
  if (!format) return new Intl.NumberFormat("en-US").format(value);
  const isMoney = format.startsWith("$");
  const hasPlus = format.endsWith("+");
  const suffix = hasPlus ? "+" : "";

  let v = value;
  let unit = "";
  if (format.includes("0,0a")) {
    const abs = Math.abs(v);
    if (abs >= 1_000_000_000) {
      v = v / 1_000_000_000;
      unit = "b";
    } else if (abs >= 1_000_000) {
      v = v / 1_000_000;
      unit = "m";
    } else if (abs >= 1_000) {
      v = v / 1_000;
      unit = "k";
    }
  }
  const num = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(v);
  return `${isMoney ? "$" : ""}${num}${unit}${suffix}`;
}

export function shouldReduceMotion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
