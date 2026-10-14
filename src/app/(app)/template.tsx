'use client';
/**
 * (app) template — re-mounts on every route navigation, giving the learning
 * flow its stage-transition animation (replaces the old AnimatePresence
 * stage wrapper in AppShell). Same fade/slide feel, now route-driven.
 */
import React from 'react';
import { motion } from 'motion/react';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
