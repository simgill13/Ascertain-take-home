import { useNavigate } from '@tanstack/react-router'
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

type DeletePatientDialogProps = {
  patient: Patient
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeletePatientDialog({ patient, open, onOpenChange }: DeletePatientDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {fullName}?</DialogTitle>
          <DialogDescription>
            The chart and all of its clinical notes will be permanently removed. This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={remove.isPending}>
            Keep patient
          </Button>
          <Button variant="destructive" onClick={confirmDelete} disabled={remove.isPending}>
            Delete patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
