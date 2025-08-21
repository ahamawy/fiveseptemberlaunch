"use client";
import { motion } from 'framer-motion';
import ix from '@/config/interactions.json';
import strings from '@/content/strings.en.json';
import home from '@/content/homepage.json';
import Link from 'next/link';
import { COMPONENT_STYLES } from '@/BRANDING/brand.config';
import { V, micro, cx } from '@/lib/motion/motion';

export default function CTA() {
  const cta = (home as any).hero?.primaryCta;
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-3xl text-center px-6">
        <motion.h3 className="text-2xl font-semibold text-white" {...V((ix as any).cta.title)}>
          {(strings as any).sections.ctaTitle}
        </motion.h3>
        <motion.p className="mt-3 text-white/70" {...V((ix as any).positioning.paragraph)}>
          {(home as any).cta.copy}
        </motion.p>
        <motion.div className="mt-8" {...V((ix as any).cta.form)}>
          <Link href={cta?.href || '/investor-portal/dashboard'} className={cx('inline-flex items-center px-6 py-3 rounded-lg', COMPONENT_STYLES.button.primary)} {...micro('buttonPrimary')}>
            {(strings as any).hero.primaryCta}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

