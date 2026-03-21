import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function TitleScreen() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-purple-950 to-slate-900 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 opacity-40">
        <motion.div
          className="absolute top-20 left-10 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl"
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl"
          animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center space-y-8 px-4 max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Title */}
        <motion.div variants={itemVariants} className="space-y-2">
          <motion.h1
            className="font-pixel text-5xl sm:text-8xl text-primary drop-shadow-2xl"
            whileHover={{ scale: 1.05, textShadow: "0 0 20px rgba(45, 212, 191, 0.8)" }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            CLICKER QUEST
          </motion.h1>
          <motion.div
            className="h-1 w-32 bg-gradient-to-r from-primary via-accent to-primary mx-auto rounded-full"
            animate={{ boxShadow: ["0 0 10px rgba(45, 212, 191, 0.5)", "0 0 30px rgba(45, 212, 191, 0.9)", "0 0 10px rgba(45, 212, 191, 0.5)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-2xl text-foreground/80 font-inter leading-relaxed"
        >
          Defeat endless enemies, grow stronger, and prestige to eternal power
        </motion.p>

        {/* Features */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6"
        >
          {[
            { icon: "⚔️", title: "Strategic Combat", color: "from-primary" },
            { icon: "✨", title: "Prestige System", color: "from-accent" },
            { icon: "🗺️", title: "Multiple Zones", color: "from-secondary" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              className={`p-5 rounded-xl bg-gradient-to-br ${feature.color} to-transparent border border-white/10 backdrop-blur-sm hover:border-white/30 transition-all`}
              whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
            >
              <p className="text-3xl mb-3">{feature.icon}</p>
              <p className="text-sm font-pixel text-foreground/80">{feature.title}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants} className="pt-4">
          <motion.button
            onClick={() => navigate("/Game")}
            className="relative px-12 py-4 text-lg font-pixel text-primary-foreground bg-gradient-to-r from-primary to-accent rounded-lg overflow-hidden group"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
              initial={false}
            />
            <span className="relative flex items-center gap-3 justify-center">
              START GAME
              <motion.span
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>
          </motion.button>
        </motion.div>

        {/* Bottom text */}
        <motion.p
          variants={itemVariants}
          className="text-xs sm:text-sm text-foreground/50 font-inter"
        >
          Click, upgrade, and become legendary
        </motion.p>
      </motion.div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full opacity-50"
            animate={{
              y: [0, -300],
              opacity: [0, 1, 0],
              x: Math.sin(i) * 100,
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${20 + i * 15}%`,
              bottom: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}