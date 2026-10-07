import { Link } from '@tanstack/react-router'
import { NotebookPenIcon } from 'lucide-react'
import type { RefObject } from 'react'

import { FactGrid } from '@/components/fact-grid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { PatientStatusBadge } from '@/features/patients/patient-status-badge'
import type { Patient } from '@/features/patients/types'
import { formatAge, formatDate, formatRelativeDate } from '@/lib/format'

type PatientDrawerProps = {
  patient: Patient | null
  onClose: () => void
  /** Element that opened the drawer; focus returns there on close. */
  returnFocusTo: RefObject<HTMLElement | null>
}

/** Right-side preview of a patient; the chart itself opens from the footer. */
export function PatientDrawer({ patient, onClose, returnFocusTo }: PatientDrawerProps) {
  return (
    <Sheet open={patient !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 data-[state=closed]:duration-150 data-[state=open]:duration-200 sm:max-w-sm"
        onCloseAutoFocus={(event) => {
          // The sheet is controlled without a trigger, so Radix has nothing to return focus to.
          event.preventDefault()
          returnFocusTo.current?.focus()
        }}
      >
        {patient ? (
          <>
            <SheetHeader className="border-b px-6 py-5">
              <SheetTitle className="text-lg">
                {patient.first_name} {patient.last_name}
              </SheetTitle>
              <SheetDescription>DOB {formatDate(patient.date_of_birth)}</SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <section>
                <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
                  Patient
                </p>
                <dl className="space-y-3 text-sm">
                  <DrawerRow label="Status">
                    <PatientStatusBadge status={patient.status} />
                  </DrawerRow>
                  <DrawerRow label="Age">{formatAge(patient.age)}</DrawerRow>
                  <DrawerRow label="Blood type">{patient.blood_type ?? 'Unknown'}</DrawerRow>
                  <DrawerRow label="Last visit">
                    {formatRelativeDate(patient.last_visit_at)}
                  </DrawerRow>
                  <DrawerRow label="Phone">{patient.phone}</DrawerRow>
                </dl>
              </section>

              <section className="border-t pt-5">
                <FactGrid
                  className="flex-col gap-y-4"
                  facts={[
                    {
                      label: 'Conditions',
                      value: <TagRow tags={patient.conditions} emptyLabel="None recorded" />,
                    },
                    {
                      label: 'Allergies',
                      value: (
                        <TagRow tags={patient.allergies} emptyLabel="No known allergies" allergy />
                      ),
                    },
                  ]}
                />
              </section>
            </div>

            <SheetFooter className="flex-row gap-2 border-t px-6 py-4">
              <Button asChild className="flex-1">
                <Link to="/patients/$patientId" params={{ patientId: patient.id }}>
                  Open chart
                </Link>
              </Button>
              <Button asChild variant="secondary" className="flex-1">
                <Link
                  to="/patients/$patientId"
                  params={{ patientId: patient.id }}
                  search={{ tab: 'notes' }}
                >
                  <NotebookPenIcon aria-hidden="true" />
                  Add note
                </Link>
              </Button>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function DrawerRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-center gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  )
}

function TagRow({
  tags,
  emptyLabel,
  allergy = false,
}: {
  tags: string[]
  emptyLabel: string
  allergy?: boolean
}) {
  if (tags.length === 0) {
    return <span className="text-muted-foreground font-normal">{emptyLabel}</span>
  }
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li key={tag}>
          <Badge variant={allergy ? 'destructive' : 'secondary'}>{tag}</Badge>
        </li>
      ))}
    </ul>
  )
}
