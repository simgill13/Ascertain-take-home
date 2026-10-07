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

import { useMediaQuery } from '@/hooks/use-media-query'

import { Badge } from '@/components/ui/badge'
import { SAMPLE_CARDS } from '@/features/landing/landing-copy'

const CARD_OFFSETS = [
  { shiftX: 0, shiftY: 0, rotateZ: 0, depth: 0 },
  { shiftX: 28, shiftY: 36, rotateZ: 3, depth: -70 },
  { shiftX: 56, shiftY: 72, rotateZ: 6, depth: -140 },
] as const

// Scroll fans the stack open and pulls it toward the camera; the pointer adds a small tilt.
const SCROLL_ROTATE_X = [14, -4]
const SCROLL_ROTATE_Y = [-18, 6]
const SCROLL_SPREAD = [1, 1.6]
const MAX_TILT_DEGREES = 6
// Narrow screens get half the fan so the back cards stay inside the viewport.
const NARROW_FAN_SCALE = 0.5
// Pose shown when the visitor prefers reduced motion.
const STATIC_ROTATE_X = 6
const STATIC_ROTATE_Y = -8

export function HeroCardStack() {
  const reduceMotion = useReducedMotion()
  const isNarrowScreen = useMediaQuery('(max-width: 639px)')
  const fanScale = isNarrowScreen ? NARROW_FAN_SCALE : 1
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
      reduceMotion ? STATIC_ROTATE_X : (fromScroll ?? 0) + (fromPointer ?? 0),
  )
  const rotateY = useTransform(
    [scrollRotateY, springTiltY],
    ([fromScroll, fromPointer]: number[]) =>
      reduceMotion ? STATIC_ROTATE_Y : (fromScroll ?? 0) + (fromPointer ?? 0),
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
      className="relative mx-auto aspect-[4/3] w-[82%] max-w-md select-none sm:w-full sm:max-w-lg"
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
            stackPosition={cardIndex}
            spread={spread}
            fanScale={fanScale}
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
  fanScale: number
  stackPosition: number
  reduceMotion: boolean
  entranceDelay: number
}

function StackedCard({
  card,
  offset,
  spread,
  fanScale,
  stackPosition,
  reduceMotion,
  entranceDelay,
}: StackedCardProps) {
  const effectiveSpread = (spreadFactor: number) => (reduceMotion ? 1 : spreadFactor) * fanScale
  const translateX = useTransform(
    spread,
    (spreadFactor) => offset.shiftX * effectiveSpread(spreadFactor),
  )
  const translateY = useTransform(
    spread,
    (spreadFactor) => offset.shiftY * effectiveSpread(spreadFactor),
  )
  const translateZ = useTransform(
    spread,
    (spreadFactor) => offset.depth * effectiveSpread(spreadFactor),
  )

  return (
    <motion.article
      className="bg-card text-card-foreground absolute inset-x-0 top-0 rounded-xl border p-5 shadow-[0_24px_60px_-24px_oklch(0.22_0.02_250_/_0.35)]"
      style={{
        x: translateX,
        y: translateY,
        z: translateZ,
        rotateZ: offset.rotateZ,
        zIndex: SAMPLE_CARDS.length - stackPosition,
      }}
      initial={reduceMotion ? false : { opacity: 0, y: offset.shiftY + 40 }}
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
