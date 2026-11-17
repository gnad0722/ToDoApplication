import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/config/queryKeys';
import { noteService } from '@/services/noteService';
import { getErrorMessage } from '@/utils/errors';

function invalidateNoteRelated(qc: QueryClient, taskId: number) {
  qc.invalidateQueries({ queryKey: queryKeys.notes.byTask(taskId) });
  // Task rows show a note icon, so refresh tasks as well.
  qc.invalidateQueries({ queryKey: queryKeys.tasks.all });
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
    onError: (e) => toast.error(getErrorMessage(e)),
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
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
