"use client";
import Link from "next/link";
import { COMPONENT_STYLES } from "@/BRANDING/brand.config";
import { motion } from "framer-motion";
import { micro } from "@/lib/motion/motion";

export default function Nav() {
  return (
    <nav className="relative z-10">
      <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
        <Link href="/" className="text-white font-semibold tracking-wide">
          EquiTie
        </Link>
        <div className="flex items-center gap-4">
          <Link href="#about" className="text-white/70 hover:text-white">
            <span className="inline-block">About</span>
          </Link>
          <motion.div {...micro("buttonPrimary")}>
            <Link
              href="/investor-portal/dashboard"
              className={COMPONENT_STYLES.button.secondary}
            >
              Enter Portal
            </Link>
          </motion.div>
        </div>
      </div>
    </nav>
  );
}
