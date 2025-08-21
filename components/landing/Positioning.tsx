"use client";
import { motion } from "framer-motion";
import ix from "@/config/interactions.json";
import strings from "@/content/strings.en.json";
import home from "@/content/homepage.json";
import { BRAND_CONFIG } from "@/BRANDING/brand.config";
import { V, cx } from "@/lib/motion/motion";

export default function Positioning() {
  const section = (home as any).positioning || {};
  const paragraphs: any[] = section.paragraphs || [];
  const claims: string[] = section.claims || [];

  return (
    <section id="why" className="relative py-16">
      <div className="mx-auto max-w-3xl px-6">
        <motion.h2
          className={cx("text-2xl md:text-3xl font-semibold text-white")}
          {...V((ix as any).positioning.title)}
        >
          {(strings as any).sections.positioningTitle}
        </motion.h2>

        <div className="mt-5 space-y-4">
          {paragraphs.map((p: any, idx: number) => (
            <motion.p
              key={idx}
              className="text-white/80 text-lg"
              {...V((ix as any).positioning.paragraph)}
            >
              {p?.textKey ? (strings as any).sections[p.textKey.split(".").slice(-1)[0]] : ""}
            </motion.p>
          ))}
        </div>

        {claims?.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {claims.map((c) => (
              <motion.span
                key={c}
                className="px-3 py-1 rounded-full text-sm text-white/80 border border-white/15"
                style={{ background: BRAND_CONFIG.gradients.surface }}
                {...V((ix as any).positioning.claims)}
              >
                {c.replace(/-/g, " ")}
              </motion.span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

