import { Link } from '@tanstack/react-router'
import { ArrowRightIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import { Button } from '@/components/ui/button'
import { HeroCardStack } from '@/features/landing/hero-card-stack'
import { LANDING_COPY } from '@/features/landing/landing-copy'
import { ParallaxBackdrop } from '@/features/landing/parallax-backdrop'
import { ValueProps } from '@/features/landing/value-props'

const ENTRANCE = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }

export function LandingPage() {
  const reduceMotion = useReducedMotion()
  const entrance = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { ...ENTRANCE, delay },
        }

  return (
    <div className="bg-background text-foreground relative min-h-dvh overflow-x-clip">
      <ParallaxBackdrop />

      <header className="relative mx-auto flex max-w-6xl items-center px-6 py-5 sm:px-8">
        <Link to="/welcome" className="flex items-center gap-2 rounded-md font-semibold">
          <span
            aria-hidden="true"
            className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-md text-xs font-bold"
          >
            N
          </span>
          <span className="font-display text-lg tracking-tight">Northlight</span>
        </Link>
      </header>

      <main className="relative">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-10 pb-24 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16 lg:pt-16 lg:pb-32">
          <div className="max-w-xl">
            <motion.p className="text-muted-foreground text-sm" {...entrance(0)}>
              {LANDING_COPY.practiceName}
            </motion.p>
            <motion.h1
              className="font-display mt-4 text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
              {...entrance(0.08)}
            >
              {LANDING_COPY.headline}
            </motion.h1>
            <motion.p
              className="text-muted-foreground mt-6 max-w-prose text-lg leading-relaxed"
              {...entrance(0.16)}
            >
              {LANDING_COPY.subheadline}
            </motion.p>
            <motion.div className="mt-10" {...entrance(0.24)}>
              <CallToActionButton />
            </motion.div>
          </div>

          <div className="pt-6 lg:pt-0 lg:pr-24 xl:pr-12">
            <HeroCardStack />
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:py-28">
            <ValueProps />
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-20 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:py-28">
            <p className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {LANDING_COPY.closingLine}
            </p>
            <CallToActionButton />
          </div>
        </section>
      </main>

      <footer className="text-muted-foreground mx-auto max-w-6xl px-6 py-8 text-xs sm:px-8">
        {LANDING_COPY.practiceName}. Sample data only; every patient shown is fictional.
      </footer>
    </div>
  )
}

function CallToActionButton() {
  return (
    <Button asChild size="lg" className="h-12 px-6 text-base">
      <Link to="/">
        {LANDING_COPY.callToAction}
        <ArrowRightIcon aria-hidden="true" />
      </Link>
    </Button>
  )
}
