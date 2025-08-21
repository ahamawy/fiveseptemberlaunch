"use client";
import { useEffect, useState } from "react";
import motionCfg from "@/config/motion.json";
import { BRAND_CONFIG } from "@/BRANDING/brand.config";

export default function Background() {
  const glow = (motionCfg as any)?.variants?.glowFollow || { enabled: false };
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!glow?.enabled) return;
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [glow?.enabled]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <div
        className="absolute inset-0"
        style={{ background: BRAND_CONFIG.gradients.dark }}
      />
      <div
        className="absolute inset-0"
        style={{ background: BRAND_CONFIG.gradients.radial }}
      />
      {glow?.enabled && pos ? (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-20"
          style={{
            left: pos.x,
            top: pos.y,
            width: glow.radius || 180,
            height: glow.radius || 180,
            background: BRAND_CONFIG.gradients.hero,
            filter: `blur(${(glow.radius || 180) / 6}px)`,
          }}
        />
      ) : null}
    </div>
  );
}
