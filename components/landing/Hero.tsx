"use client";
import { motion, useMotionValue, useTransform } from "framer-motion";
import ix from "@/config/interactions.json";
import strings from "@/content/strings.en.json";
import home from "@/content/homepage.json";
import { BRAND_CONFIG, COMPONENT_STYLES } from "@/BRANDING/brand.config";
import { V, micro, cx } from "@/lib/motion/motion";
import Link from "next/link";
import { useEffect } from "react";

export default function Hero() {
  const cta = (home as any).hero?.primaryCta;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: BRAND_CONFIG.gradients.radial }}
      />
      <div className="relative mx-auto max-w-5xl px-6 py-24 text-center">
        <motion.h1
          className={cx(
            "text-4xl md:text-6xl font-semibold tracking-tight",
            "bg-clip-text text-transparent bg-gradient-to-r from-[#C898FF] to-[#66D0FF]"
          )}
          initial={{ opacity: 0, y: 20, clipPath: "inset(0 100% 0 0)" }}
          animate={{ opacity: 1, y: 0, clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {(strings as any).hero.headline}
        </motion.h1>
        <motion.p
          className="mt-6 text-white/70 text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {(strings as any).hero.subheadline}
        </motion.p>
        {cta?.href && (
          <motion.div 
            className="mt-10 inline-block"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.83, 0, 0.17, 1] }}
          >
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
            >
              <Link
                href={cta.href}
                className={cx(
                  "inline-flex items-center px-6 py-3 rounded-lg",
                  "bg-gradient-to-r from-[#C898FF] to-[#9B7AC1] text-white font-medium",
                  "shadow-[0_0_24px_rgba(200,152,255,0.35)]",
                  "hover:shadow-[0_0_32px_rgba(200,152,255,0.5)]",
                  "transition-shadow duration-300"
                )}
              >
                {(strings as any).hero.primaryCta}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
