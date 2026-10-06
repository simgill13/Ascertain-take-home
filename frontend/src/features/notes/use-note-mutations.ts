import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { createNote, deleteNote, noteKeys, type NoteInput } from '@/features/notes/api'
import { patientKeys } from '@/features/patients/api'
import { summaryKeys } from '@/features/summary/api'
import { describeError } from '@/lib/api/describe-error'

export function useNoteMutations(patientId: string) {
  const queryClient = useQueryClient()

  // A note changes the patient's last visit and the summary narrative, so refresh both.
  const invalidateRelated = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: noteKeys.forPatient(patientId) }),
      queryClient.invalidateQueries({ queryKey: summaryKeys.forPatient(patientId) }),
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) }),
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() }),
    ])

  const addNote = useMutation({
    mutationFn: (payload: NoteInput) => createNote(patientId, payload),
    onSuccess: async () => {
      await invalidateRelated()
      toast.success('Note added')
    },
    onError: (error) => {
      const described = describeError(error)
      toast.error(described.title, { description: described.message })
    },
  })

  const removeNote = useMutation({
    mutationFn: (noteId: string) => deleteNote(patientId, noteId),
    onSuccess: async () => {
      await invalidateRelated()
      toast.success('Note deleted')
    },
    onError: (error) => {
      const described = describeError(error)
      toast.error(described.title, { description: described.message })
    },
  })

  return { addNote, removeNote }
}
