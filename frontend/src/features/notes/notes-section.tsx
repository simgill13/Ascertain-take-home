import { useQuery } from '@tanstack/react-query'
import { NotebookPenIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'

import { EmptyState } from '@/components/state/empty-state'
import { ErrorState } from '@/components/state/error-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LoadingStatus } from '@/components/state/loading-status'
import { Skeleton } from '@/components/ui/skeleton'
import { notesQueryOptions, type Note } from '@/features/notes/api'
import { NoteForm } from '@/features/notes/note-form'
import { useNoteMutations } from '@/features/notes/use-note-mutations'
import { formatDateTime, formatRelativeDate } from '@/lib/format'

const SKELETON_NOTE_COUNT = 3

type NotesSectionProps = {
  patientId: string
}

export function NotesSection({ patientId }: NotesSectionProps) {
  const notesQuery = useQuery(notesQueryOptions(patientId))
  const { addNote, removeNote } = useNoteMutations(patientId)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)

  return (
    <Card id="notes">
      <CardHeader>
        <CardTitle>Clinical notes</CardTitle>
        <CardDescription>Newest first. Adding a note updates the last visit date.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NoteForm onSubmit={addNote.mutateAsync} isSubmitting={addNote.isPending} />
        <NotesBody notesQuery={notesQuery} onRequestDelete={setNoteToDelete} />
      </CardContent>

      <DeleteNoteDialog
        note={noteToDelete}
        isDeleting={removeNote.isPending}
        onCancel={() => setNoteToDelete(null)}
        onConfirm={(note) => removeNote.mutate(note.id, { onSettled: () => setNoteToDelete(null) })}
      />
    </Card>
  )
}

type NotesBodyProps = {
  notesQuery: ReturnType<typeof useQuery<{ items: Note[]; total: number }>>
  onRequestDelete: (note: Note) => void
}

function NotesBody({ notesQuery, onRequestDelete }: NotesBodyProps) {
  if (notesQuery.isPending) return <NotesSkeleton />
  if (notesQuery.isError) {
    return <ErrorState error={notesQuery.error} onRetry={() => void notesQuery.refetch()} />
  }
  if (notesQuery.data.items.length === 0) {
    return (
      <EmptyState
        icon={<NotebookPenIcon className="size-8" />}
        title="No notes yet"
        description="The first note you add will appear here and feed the summary."
      />
    )
  }
  return <NotesList notes={notesQuery.data.items} onRequestDelete={onRequestDelete} />
}

function NotesList({
  notes,
  onRequestDelete,
}: {
  notes: Note[]
  onRequestDelete: (note: Note) => void
}) {
  return (
    <ol className="divide-y" aria-label="Clinical notes">
      {notes.map((note) => (
        <li key={note.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-xs">
              <time dateTime={note.noted_at} title={formatDateTime(note.noted_at)}>
                {formatDateTime(note.noted_at)}
              </time>
              <span aria-hidden="true"> · </span>
              <span>{formatRelativeDate(note.noted_at)}</span>
            </p>
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive shrink-0"
            aria-label={`Delete note from ${formatDateTime(note.noted_at)}`}
            onClick={() => onRequestDelete(note)}
          >
            <Trash2Icon />
          </Button>
        </li>
      ))}
    </ol>
  )
}

type DeleteNoteDialogProps = {
  note: Note | null
  isDeleting: boolean
  onCancel: () => void
  onConfirm: (note: Note) => void
}

function DeleteNoteDialog({ note, isDeleting, onCancel, onConfirm }: DeleteNoteDialogProps) {
  return (
    <Dialog open={note !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this note?</DialogTitle>
          <DialogDescription>
            The note from {note ? formatDateTime(note.noted_at) : ''} will be removed from the
            chart. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Keep note
          </Button>
          <Button
            variant="destructive"
            disabled={isDeleting || note === null}
            onClick={() => note && onConfirm(note)}
          >
            Delete note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function NotesSkeleton() {
  return (
    <LoadingStatus label="Loading notes" className="space-y-4">
      {Array.from({ length: SKELETON_NOTE_COUNT }, (_unused, rowIndex) => (
        <div key={rowIndex} className="space-y-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </LoadingStatus>
  )
}
