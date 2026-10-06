import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

// Shifts stay within 24px so the movement reads as depth without inducing discomfort.
const SLOW_LAYER_SHIFT = [0, -24]
const FAST_LAYER_SHIFT = [0, 16]

export function ParallaxBackdrop() {
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const slowShift = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : SLOW_LAYER_SHIFT)
  const fastShift = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : FAST_LAYER_SHIFT)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="bg-accent/60 absolute -top-32 -right-24 size-[28rem] rounded-full blur-3xl"
        style={{ y: slowShift }}
      />
      <motion.div
        className="bg-primary/10 absolute top-[38rem] -left-40 size-[32rem] rounded-full blur-3xl"
        style={{ y: fastShift }}
      />
    </div>
  )
}
