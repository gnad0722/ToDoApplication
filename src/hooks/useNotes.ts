import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/config/queryKeys';
import { noteService } from '@/services/noteService';
import { isApiError } from '@/utils/errors';
import { notifyMutationError } from '@/utils/formErrors';

function invalidateNoteRelated(qc: QueryClient, taskId: number) {
  qc.invalidateQueries({ queryKey: queryKeys.notes.byTask(taskId) });
}

export function useNote(taskId: number) {
  return useQuery({
    queryKey: queryKeys.notes.byTask(taskId),
    queryFn: () => noteService.getByTask(taskId),
  });
}

/** Creates the note if the task has none yet, otherwise updates it. */
export function useSaveNote(taskId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ description, exists }: { description: string; exists: boolean }) =>
      exists ? noteService.update(taskId, description) : noteService.create(taskId, description),
    onSuccess: (_n, { exists }) => {
      invalidateNoteRelated(qc, taskId);
      toast.success(exists ? 'Note updated' : 'Note added');
    },
    onError: (e) => {
      notifyMutationError(e);
      // 409 "This task already has a note" / 404 "Note not found": our cache is stale.
      if (isApiError(e, 409) || isApiError(e, 404)) invalidateNoteRelated(qc, taskId);
    },
  });
}

export function useDeleteNote(taskId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => noteService.remove(taskId),
    onSuccess: () => {
      qc.setQueryData(queryKeys.notes.byTask(taskId), null);
      invalidateNoteRelated(qc, taskId);
      toast.success('Note deleted');
    },
    onError: notifyMutationError,
  });
}
