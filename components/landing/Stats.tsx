"use client";
import { motion, useMotionValue, useSpring } from "framer-motion";
import ix from "@/config/interactions.json";
import home from "@/content/homepage.json";
import { BRAND_CONFIG, COMPONENT_STYLES } from "@/lib/config/brand.config";
import { V, formatNumber, cx, micro } from "@/lib/motion/motion";

export default function Stats() {
  const stats = (home as any).stats || [];
  
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, scale: 0.98, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.83, 0, 0.17, 1],
      },
    },
  };

  return (
    <section className="relative">
      <motion.div
        className="mx-auto max-w-5xl px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {stats.map((s: any, i: number) => (
          <motion.div
            key={s.id}
            className={cx(
              "group relative p-4 rounded-xl overflow-hidden",
              "bg-gradient-to-br from-white/[0.08] to-white/[0.04]",
              "backdrop-blur-md border border-white/10",
              "hover:border-white/20 transition-all duration-300"
            )}
            variants={itemVariants}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 180, damping: 18 } }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-br from-[#C898FF]/10 to-[#66D0FF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <div className="relative z-10">
              <div className="text-white/60 text-sm">
                {s.label}
                {s.note ? (
                  <span className="text-white/40"> · {s.note}</span>
                ) : null}
              </div>
              <motion.div 
                className="mt-2 text-2xl font-semibold text-white"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.05 }}
                viewport={{ once: true }}
              >
                {formatNumber(s.value, s.format)}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
