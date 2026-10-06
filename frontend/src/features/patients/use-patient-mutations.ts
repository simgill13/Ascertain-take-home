import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createPatient, deletePatient, patientKeys, updatePatient } from '@/features/patients/api'
import type { Patient, PatientInput } from '@/features/patients/types'

export function usePatientMutations() {
  const queryClient = useQueryClient()

  const invalidateLists = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: patientKeys.stats() }),
    ])

  const create = useMutation({
    mutationFn: (payload: PatientInput) => createPatient(payload),
    onSuccess: async (created: Patient) => {
      queryClient.setQueryData(patientKeys.detail(created.id), created)
      await invalidateLists()
    },
  })

  const update = useMutation({
    mutationFn: ({ patientId, payload }: { patientId: string; payload: PatientInput }) =>
      updatePatient(patientId, payload),
    onSuccess: async (updated: Patient) => {
      queryClient.setQueryData(patientKeys.detail(updated.id), updated)
      await invalidateLists()
    },
  })

  const remove = useMutation({
    mutationFn: (patientId: string) => deletePatient(patientId),
    onSuccess: async (_nothing, patientId) => {
      queryClient.removeQueries({ queryKey: patientKeys.detail(patientId) })
      await invalidateLists()
    },
  })

  return { create, update, remove }
}
