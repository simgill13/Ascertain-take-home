import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useRef } from 'react'

import { Badge } from '@/components/ui/badge'
import { SAMPLE_CARDS } from '@/features/landing/landing-copy'

const CARD_OFFSETS = [
  { x: 0, y: 0, rotateZ: 0, depth: 0 },
  { x: 28, y: 36, rotateZ: 3, depth: -70 },
  { x: 56, y: 72, rotateZ: 6, depth: -140 },
] as const

// Scroll fans the stack open and pulls it toward the camera; the pointer adds a small tilt.
const SCROLL_ROTATE_X = [14, -4]
const SCROLL_ROTATE_Y = [-18, 6]
const SCROLL_SPREAD = [1, 1.6]
const MAX_TILT_DEGREES = 6

export function HeroCardStack() {
  const reduceMotion = useReducedMotion()
  const stackRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ['start end', 'end start'],
  })
  const scrollRotateX = useTransform(scrollYProgress, [0, 1], SCROLL_ROTATE_X)
  const scrollRotateY = useTransform(scrollYProgress, [0, 1], SCROLL_ROTATE_Y)
  const spread = useTransform(scrollYProgress, [0, 1], SCROLL_SPREAD)

  const pointerTiltX = useMotionValue(0)
  const pointerTiltY = useMotionValue(0)
  const springTiltX = useSpring(pointerTiltX, { stiffness: 160, damping: 18 })
  const springTiltY = useSpring(pointerTiltY, { stiffness: 160, damping: 18 })

  const rotateX = useTransform(
    [scrollRotateX, springTiltX],
    ([fromScroll, fromPointer]: number[]) =>
      reduceMotion ? 6 : (fromScroll ?? 0) + (fromPointer ?? 0),
  )
  const rotateY = useTransform(
    [scrollRotateY, springTiltY],
    ([fromScroll, fromPointer]: number[]) =>
      reduceMotion ? -8 : (fromScroll ?? 0) + (fromPointer ?? 0),
  )

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !stackRef.current) return
    const bounds = stackRef.current.getBoundingClientRect()
    const horizontalRatio = (event.clientX - bounds.left) / bounds.width - 0.5
    const verticalRatio = (event.clientY - bounds.top) / bounds.height - 0.5
    pointerTiltY.set(horizontalRatio * MAX_TILT_DEGREES * 2)
    pointerTiltX.set(-verticalRatio * MAX_TILT_DEGREES * 2)
  }

  const resetTilt = () => {
    pointerTiltX.set(0)
    pointerTiltY.set(0)
  }

  return (
    <div
      ref={stackRef}
      className="relative mx-auto aspect-[4/3] w-full max-w-md select-none sm:max-w-lg"
      style={{ perspective: 1400 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        {SAMPLE_CARDS.map((card, cardIndex) => (
          <StackedCard
            key={card.name}
            card={card}
            offset={CARD_OFFSETS[cardIndex] ?? CARD_OFFSETS[0]}
            spread={spread}
            reduceMotion={Boolean(reduceMotion)}
            entranceDelay={0.15 * (SAMPLE_CARDS.length - cardIndex)}
          />
        ))}
      </motion.div>
    </div>
  )
}

type StackedCardProps = {
  card: (typeof SAMPLE_CARDS)[number]
  offset: (typeof CARD_OFFSETS)[number]
  spread: MotionValue<number>
  reduceMotion: boolean
  entranceDelay: number
}

function StackedCard({ card, offset, spread, reduceMotion, entranceDelay }: StackedCardProps) {
  const translateX = useTransform(spread, (value) => offset.x * (reduceMotion ? 1 : value))
  const translateY = useTransform(spread, (value) => offset.y * (reduceMotion ? 1 : value))
  const translateZ = useTransform(spread, (value) => offset.depth * (reduceMotion ? 1 : value))

  return (
    <motion.article
      className="bg-card text-card-foreground absolute inset-x-0 top-0 rounded-xl border p-5 shadow-[0_24px_60px_-24px_oklch(0.22_0.02_250_/_0.35)]"
      style={{
        x: translateX,
        y: translateY,
        z: translateZ,
        rotateZ: offset.rotateZ,
        zIndex: 10 - Math.round(Math.abs(offset.depth) / 70),
      }}
      initial={reduceMotion ? false : { opacity: 0, y: offset.y + 40 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: entranceDelay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold">{card.name}</p>
          <p className="text-muted-foreground text-xs">{card.meta}</p>
        </div>
        <Badge variant="outline" className="gap-1.5 font-normal">
          <span
            className={
              card.status === 'Active'
                ? 'bg-status-active size-2 rounded-full'
                : 'bg-status-pending size-2 rounded-full'
            }
          />
          {card.status}
        </Badge>
      </div>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {card.tags.map((tag) => (
          <li key={tag}>
            <Badge variant="secondary">{tag}</Badge>
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground mt-3 border-t pt-3 text-sm leading-relaxed">
        {card.note}
      </p>
    </motion.article>
  )
}
