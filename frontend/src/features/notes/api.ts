import { queryOptions } from '@tanstack/react-query'

import { apiClient, request } from '@/lib/api/client'
import type { components } from '@/lib/api/schema'

export type Note = components['schemas']['NoteRead']
export type NoteInput = components['schemas']['NoteCreate']
export type NoteListResponse = components['schemas']['NoteListResponse']

export const noteKeys = {
  all: ['notes'] as const,
  forPatient: (patientId: string) => [...noteKeys.all, patientId] as const,
}

export function notesQueryOptions(patientId: string) {
  return queryOptions({
    queryKey: noteKeys.forPatient(patientId),
    queryFn: (): Promise<NoteListResponse> =>
      request(() =>
        apiClient.GET('/patients/{patient_id}/notes', {
          params: { path: { patient_id: patientId } },
        }),
      ),
  })
}

export function createNote(patientId: string, payload: NoteInput): Promise<Note> {
  return request(() =>
    apiClient.POST('/patients/{patient_id}/notes', {
      params: { path: { patient_id: patientId } },
      body: payload,
    }),
  )
}

export function deleteNote(patientId: string, noteId: string): Promise<void> {
  return request(() =>
    apiClient.DELETE('/patients/{patient_id}/notes/{note_id}', {
      params: { path: { patient_id: patientId, note_id: noteId } },
    }),
  ).then(() => undefined)
}
