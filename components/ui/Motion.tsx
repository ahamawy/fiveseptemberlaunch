"use client";

import React from "react";
import { motion } from "framer-motion";

export const MotionSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1], delay: delay || 0 }}
  >
    {children}
  </motion.div>
);


