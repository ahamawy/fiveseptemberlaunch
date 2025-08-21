"use client";
import { motion } from "framer-motion";
import ix from "@/config/interactions.json";
import home from "@/content/homepage.json";
import { COMPONENT_STYLES } from "@/BRANDING/brand.config";
import { V, formatNumber, cx, micro } from "@/lib/motion/motion";

export default function Stats() {
  const stats = (home as any).stats || [];
  return (
    <section className="relative">
      <motion.div
        className="mx-auto max-w-5xl px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        {...V((ix as any).stats.container)}
      >
        {stats.map((s: any) => (
          <motion.div
            key={s.id}
            className={cx(
              "p-4 rounded-xl border border-white/10 bg-white/5",
              COMPONENT_STYLES.card.gradient
            )}
            {...V((ix as any).stats.item)}
            {...micro("card")}
          >
            <div className="text-white/60 text-sm">
              {s.label}
              {s.note ? (
                <span className="text-white/40"> · {s.note}</span>
              ) : null}
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {formatNumber(s.value, s.format)}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
