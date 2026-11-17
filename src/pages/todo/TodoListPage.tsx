import { useState } from 'react';
import { ListTodo, Plus } from 'lucide-react';
import { Button, CardGridSkeleton, ConfirmDialog, EmptyState, ErrorState, PageHeader, Pagination, SearchInput, Select } from '@/components/ui';
import { TodoCard } from '@/components/todo/TodoCard';
import { TodoFormModal } from '@/components/todo/TodoFormModal';
import { PAGE_SIZE } from '@/config/env';
import { useDebounce } from '@/hooks/useDebounce';
import { useDeleteTodo, useTodoPage } from '@/hooks/useTodos';
import type { TodoList } from '@/types/models';
import { buildFilter, compactFilters } from '@/utils/filters';

type SortKey = 'createdAt,desc' | 'startTime,asc' | 'topic,asc';
const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'createdAt,desc', label: 'Newest first' },
  { value: 'startTime,asc', label: 'Start time' },
  { value: 'topic,asc', label: 'Name (A–Z)' },
];

export function TodoListPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('createdAt,desc');
  const [page, setPage] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TodoList | null>(null);
  const [deleting, setDeleting] = useState<TodoList | null>(null);
  const debouncedSearch = useDebounce(search.trim());

  const query = {
    page,
    size: PAGE_SIZE.todos,
    sort,
    filters: compactFilters(debouncedSearch && buildFilter('topic', debouncedSearch)),
  };
  const { data, isLoading, error, refetch, isFetching } = useTodoPage(query);
  const deleteTodo = useDeleteTodo();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (todo: TodoList) => {
    setEditing(todo);
    setFormOpen(true);
  };

  const todos = data?.content ?? [];

  return (
    <>
      <PageHeader
        title="My Lists"
        description={data ? `${data.meta.totalElements} list${data.meta.totalElements === 1 ? '' : 's'}` : 'Organise your tasks into lists'}
        actions={
          <Button icon={<Plus className="size-4" />} onClick={openCreate}>
            New list
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(0);
          }}
          placeholder="Search lists by topic…"
        />
        <Select label="Sort lists" value={sort} onChange={(v) => { setSort(v); setPage(0); }} options={sortOptions} />
      </div>

      {isLoading ? (
        <CardGridSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : todos.length === 0 ? (
        debouncedSearch ? (
          <EmptyState icon={<ListTodo className="size-7" />} title="No matching lists" description={`Nothing found for “${debouncedSearch}”.`} action={<Button variant="secondary" onClick={() => setSearch('')}>Clear search</Button>} />
        ) : (
          <EmptyState
            icon={<ListTodo className="size-7" />}
            title="No lists yet"
            description="Create your first to-do list to start organising your tasks."
            action={<Button icon={<Plus className="size-4" />} onClick={openCreate}>Create your first list</Button>}
          />
        )
      ) : (
        <div className={isFetching ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {todos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} onEdit={openEdit} onDelete={setDeleting} />
            ))}
          </div>
          {data && <Pagination meta={data.meta} onPageChange={setPage} />}
        </div>
      )}

      <TodoFormModal open={formOpen} onClose={() => setFormOpen(false)} todo={editing} />

      <ConfirmDialog
        open={!!deleting}
        title="Delete to-do list?"
        message={
          <>
            <b className="text-slate-800">“{deleting?.topic}”</b>
            {deleting?.numTask ? ` and its ${deleting.numTask} task${deleting.numTask > 1 ? 's' : ''}` : ''} will be permanently deleted.
          </>
        }
        loading={deleteTodo.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          deleteTodo.mutate(deleting.id, {
            onSuccess: () => {
              setDeleting(null);
              // Go back a page if we just deleted the last item on this one.
              if (todos.length === 1 && page > 0) setPage(page - 1);
            },
          })
        }
      />
    </>
  );
}
