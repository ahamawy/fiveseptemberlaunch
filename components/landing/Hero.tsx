"use client";
import { motion } from "framer-motion";
import ix from "@/config/interactions.json";
import strings from "@/content/strings.en.json";
import home from "@/content/homepage.json";
import { BRAND_CONFIG, COMPONENT_STYLES } from "@/BRANDING/brand.config";
import { V, micro, cx } from "@/lib/motion/motion";
import Link from "next/link";

export default function Hero() {
  const cta = (home as any).hero?.primaryCta;
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
            "bg-clip-text text-transparent"
          )}
          style={{ backgroundImage: (BRAND_CONFIG as any).gradients.hero }}
          {...V((ix as any).hero.headline)}
        >
          {(strings as any).hero.headline}
        </motion.h1>
        <motion.p
          className="mt-6 text-white/70 text-lg max-w-2xl mx-auto"
          {...V((ix as any).hero.subheadline)}
        >
          {(strings as any).hero.subheadline}
        </motion.p>
        {cta?.href && (
          <motion.div className="mt-10" {...V((ix as any).hero.cta)}>
            <Link
              href={cta.href}
              className={cx(
                "inline-flex items-center px-6 py-3 rounded-lg",
                COMPONENT_STYLES.button.primary
              )}
              {...micro("buttonPrimary")}
            >
              {(strings as any).hero.primaryCta}
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
