import { useNavigate } from '@tanstack/react-router'
import { Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Patient } from '@/features/patients/types'
import { usePatientMutations } from '@/features/patients/use-patient-mutations'
import { toastApiError } from '@/lib/api/describe-error'

export function DeletePatientButton({ patient }: { patient: Patient }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const navigate = useNavigate()
  const { remove } = usePatientMutations()
  const fullName = `${patient.first_name} ${patient.last_name}`

  const confirmDelete = () => {
    remove.mutate(patient.id, {
      onSuccess: async () => {
        toast.success(`${fullName} was removed`)
        await navigate({ to: '/patients' })
      },
      onError: toastApiError,
    })
  }

  return (
    <>
      <Button variant="outline" onClick={() => setConfirmOpen(true)}>
        <Trash2Icon aria-hidden="true" />
        Delete
      </Button>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {fullName}?</DialogTitle>
            <DialogDescription>
              The chart and all of its clinical notes will be permanently removed. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={remove.isPending}
            >
              Keep patient
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={remove.isPending}>
              Delete patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
