"use client";
import { motion, useInView } from "framer-motion";
import { useState, useRef } from "react";
import ix from "@/config/interactions.json";
import strings from "@/content/strings.en.json";
import home from "@/content/homepage.json";
import { BRAND_CONFIG } from "@/BRANDING/brand.config";
import { cx } from "@/lib/motion/motion";

export default function ConvictionLibrary() {
  const section = (home as any).convictionLibrary || {};
  const items = section.items || [];
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="relative py-20" ref={ref}>
      <div className="mx-auto max-w-5xl px-6">
        <motion.h2
          className={cx(
            "text-3xl md:text-4xl font-semibold text-white mb-12",
            "bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80"
          )}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {(strings as any).sections.convictionTitle}
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {items.map((item: any) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="relative group"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div
                className={cx(
                  "relative p-6 rounded-xl overflow-hidden",
                  "bg-gradient-to-br from-white/[0.08] to-white/[0.03]",
                  "backdrop-blur-md border border-white/10",
                  "hover:border-[#C898FF]/30 transition-all duration-500"
                )}
              >
                {/* Gradient overlay on hover */}
                <div
                  className={cx(
                    "absolute inset-0 opacity-0 group-hover:opacity-100",
                    "bg-gradient-to-br from-[#C898FF]/10 to-[#66D0FF]/5",
                    "transition-opacity duration-500"
                  )}
                />
                
                {/* Quote mark */}
                <div className="absolute top-4 left-4 text-[#C898FF]/20 text-6xl font-serif leading-none">
                  "
                </div>

                {/* Quote text */}
                <div className="relative z-10 pt-8">
                  <p
                    className={cx(
                      "text-lg md:text-xl font-medium leading-relaxed",
                      hoveredId === item.id
                        ? "text-white"
                        : "text-white/80",
                      "transition-colors duration-300"
                    )}
                  >
                    {item.quote}
                  </p>
                </div>

                {/* Accent line */}
                <motion.div
                  className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#C898FF] to-[#66D0FF]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: hoveredId === item.id ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: "left" }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Highlight the main quote */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-sm text-white/50 uppercase tracking-wider">
            Core Philosophy
          </p>
          <p className="mt-2 text-2xl md:text-3xl font-semibold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C898FF] to-[#66D0FF]">
              Alpha = Access × Judgment × Patience
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}