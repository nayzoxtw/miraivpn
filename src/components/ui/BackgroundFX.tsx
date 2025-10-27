"use client";
import { motion } from "framer-motion";

export default function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      {/* halos animés très légers */}
      <motion.div
        className="absolute -top-40 left-10 h-[50rem] w-[50rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(0,180,255,.15), transparent)" }}
        animate={{ x: [0, 20, -10, 0], y: [0, -10, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-30rem] right-[-10rem] h-[60rem] w-[60rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(0,255,200,.10), transparent)" }}
        animate={{ x: [0, -20, 10, 0], y: [0, 10, -10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* film grain */}
      <div className="absolute inset-0" style={{ backgroundImage: "var(--noise)" }} />
    </div>
  );
}
