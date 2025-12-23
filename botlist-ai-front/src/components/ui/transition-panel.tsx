"use client"

import { motion, AnimatePresence, Transition } from "framer-motion"
import { ReactNode } from "react"

interface TransitionPanelProps {
  activeIndex: number
  children: ReactNode
  transition?: Transition
  variants?: {
    enter: any
    center: any
    exit: any
  }
}

export function TransitionPanel({
  activeIndex,
  children,
  transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  variants = {
    enter: { opacity: 0, y: -50, filter: "blur(4px)" },
    center: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: 50, filter: "blur(4px)" },
  },
}: TransitionPanelProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeIndex}
        initial="enter"
        animate="center"
        exit="exit"
        transition={transition}
        variants={variants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
