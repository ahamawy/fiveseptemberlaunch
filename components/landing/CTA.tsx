"use client";
import { motion } from "framer-motion";
import ix from "@/config/interactions.json";
import strings from "@/content/strings.en.json";
import home from "@/content/homepage.json";
import Link from "next/link";
import { BRAND_CONFIG, COMPONENT_STYLES } from "@/lib/config/brand.config";
import { V, micro, cx } from "@/lib/motion/motion";

export default function CTA() {
  const cta = (home as any).hero?.primaryCta;
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-3xl text-center px-6">
        <motion.h3
          className="text-2xl font-semibold text-white"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.5 }}
        >
          {(strings as any).sections.ctaTitle}
        </motion.h3>
        <motion.p
          className="mt-3 text-white/70"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
        >
          {(home as any).cta.copy}
        </motion.p>
        <motion.div 
          className="mt-8 inline-block"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.83, 0, 0.17, 1] }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.div
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
          >
            <Link
              href={cta?.href || "/investor-portal/dashboard"}
              className={cx(
                "inline-flex items-center px-8 py-4 rounded-lg",
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
      </div>
    </section>
  );
}



