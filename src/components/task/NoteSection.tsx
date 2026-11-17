import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, StickyNote, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button, ConfirmDialog, IconButton, Skeleton, Textarea } from '@/components/ui';
import { useDeleteNote, useNote, useSaveNote } from '@/hooks/useNotes';
import { LIMITS, noteSchema, type NoteForm } from '@/schemas';
import { fromNow } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';

/** A task has at most one note. This section shows, adds, edits and deletes it. */
export function NoteSection({ taskId }: { taskId: number }) {
  const { data: note, isLoading, error } = useNote(taskId);
  const save = useSaveNote(taskId);
  const remove = useDeleteNote(taskId);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<NoteForm>({ resolver: zodResolver(noteSchema) });

  const startEditing = () => {
    reset({ description: note?.description ?? '' });
    setEditing(true);
  };

  const onSubmit = ({ description }: NoteForm) => {
    save.mutate({ description: description.trim(), exists: !!note }, { onSuccess: () => setEditing(false) });
  };

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <StickyNote className="size-4 text-amber-500" /> Note
        </h3>
        {note && !editing && (
          <div className="flex gap-1">
            <IconButton aria-label="Edit note" onClick={startEditing}>
              <Pencil className="size-4" />
            </IconButton>
            <IconButton aria-label="Delete note" onClick={() => setConfirmDelete(true)} className="hover:bg-red-50 hover:text-red-600">
              <Trash2 className="size-4" />
            </IconButton>
          </div>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-20" />
      ) : error ? (
        <p className="text-sm text-red-600">{getErrorMessage(error)}</p>
      ) : editing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <Textarea
            autoFocus
            rows={5}
            placeholder="Extra details, links, reminders…"
            error={errors.description?.message}
            counter={{ value: watch('description') ?? '', min: LIMITS.noteMin }}
            {...register('description')}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(false)} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={save.isPending}>
              Save note
            </Button>
          </div>
        </form>
      ) : note ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <p className="text-sm whitespace-pre-wrap text-slate-700">{note.description}</p>
          {note.lastModifiedAt && <p className="mt-3 text-xs text-slate-400">Last edited {fromNow(note.lastModifiedAt)}</p>}
        </div>
      ) : (
        <button
          type="button"
          onClick={startEditing}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-6 text-sm font-medium text-slate-500 transition-colors hover:border-brand-300 hover:text-brand-600 cursor-pointer"
        >
          <Plus className="size-4" /> Add a note
        </button>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete note?"
        message="This note will be permanently removed from the task."
        loading={remove.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate(undefined, { onSuccess: () => setConfirmDelete(false) })}
      />
    </section>
  );
}
