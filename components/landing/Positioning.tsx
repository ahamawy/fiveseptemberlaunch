"use client";
import { motion, useInView } from "framer-motion";
import ix from "@/config/interactions.json";
import strings from "@/content/strings.en.json";
import home from "@/content/homepage.json";
import { BRAND_CONFIG } from "@/BRANDING/brand.config";
import { V, cx } from "@/lib/motion/motion";
import { useRef } from "react";

export default function Positioning() {
  const section = (home as any).positioning || {};
  const paragraphs: any[] = section.paragraphs || [];
  const claims: string[] = section.claims || [];
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id="why" className="relative py-20" ref={ref}>
      <div className="mx-auto max-w-4xl px-6">
        <motion.h2
          className={cx(
            "text-3xl md:text-4xl font-semibold text-white mb-8",
            "bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80"
          )}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {(strings as any).sections.positioningTitle}
        </motion.h2>

        <div className="space-y-6">
          {paragraphs.map((p: any, idx: number) => {
            // Extract the key from textKey (e.g., "sections.positioningBody1" -> "positioningBody1")
            const key = p.textKey?.split('.').pop();
            const text = key ? (strings as any).sections[key] : '';
            
            // Special styling for the first paragraph (the main quote)
            const isMainQuote = idx === 0;
            
            return (
              <motion.p
                key={idx}
                className={cx(
                  isMainQuote 
                    ? "text-2xl md:text-3xl font-medium text-white leading-tight"
                    : "text-lg md:text-xl text-white/70 leading-relaxed"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ 
                  duration: 0.7, 
                  delay: 0.1 + idx * 0.15,
                  ease: [0.22, 1, 0.36, 1] 
                }}
              >
                {isMainQuote && (
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C898FF] via-white to-[#66D0FF]">
                    {text}
                  </span>
                )}
                {!isMainQuote && text}
              </motion.p>
            );
          })}
        </div>

        {claims?.length ? (
          <motion.div 
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {claims.map((c, idx) => (
              <motion.span
                key={c}
                className={cx(
                  "px-4 py-2 rounded-lg text-sm text-white/80",
                  "bg-gradient-to-r from-white/[0.08] to-white/[0.04]",
                  "backdrop-blur-sm border border-white/10",
                  "hover:border-white/20 transition-all duration-300"
                )}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.6 + idx * 0.1,
                  ease: [0.83, 0, 0.17, 1]
                }}
                whileHover={{ y: -2 }}
              >
                {c.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </motion.span>
            ))}
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}


