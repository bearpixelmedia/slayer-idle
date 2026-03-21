import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function TitleScreen() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl animate-float" />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center space-y-8 px-4 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Title */}
        <motion.h1
          className="font-pixel text-6xl sm:text-7xl text-primary drop-shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          CLICKER QUEST
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl sm:text-2xl text-foreground/80 font-inter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Defeat endless enemies, grow stronger, and prestige to eternal power
        </motion.p>

        {/* Features */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-2xl mb-2">⚔️</p>
            <p className="text-sm font-pixel text-foreground/70">Strategic Combat</p>
          </div>
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
            <p className="text-2xl mb-2">✨</p>
            <p className="text-sm font-pixel text-foreground/70">Prestige System</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/30">
            <p className="text-2xl mb-2">🗺️</p>
            <p className="text-sm font-pixel text-foreground/70">Multiple Zones</p>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Button
            onClick={() => navigate("/Game")}
            size="lg"
            className="text-lg px-12 py-6 font-pixel gap-2 hover:scale-105 transition-transform"
          >
            START GAME
            <span className="text-xl">→</span>
          </Button>
        </motion.div>

        {/* Bottom text */}
        <motion.p
          className="text-xs sm:text-sm text-foreground/50 font-inter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          Click, upgrade, and become legendary
        </motion.p>
      </motion.div>
    </div>
  );
}