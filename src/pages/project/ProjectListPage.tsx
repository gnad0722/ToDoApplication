import { useState } from 'react';
import { FolderKanban, Plus } from 'lucide-react';
import { ProjectCard } from '@/components/project/ProjectCard';
import { ProjectFormModal } from '@/components/project/ProjectFormModal';
import { Button, CardGridSkeleton, ConfirmDialog, EmptyState, ErrorState, PageHeader, Pagination, SearchInput, Select } from '@/components/ui';
import { PAGE_SIZE } from '@/config/env';
import { useDebounce } from '@/hooks/useDebounce';
import { useDeleteProject, useProjectPage } from '@/hooks/useProjects';
import type { Project } from '@/types/models';
import { compactFilters, projectFilters, type ProjectSort } from '@/utils/filters';

type SortKey = Extract<ProjectSort, 'createdAt,desc' | 'expectEnd,asc' | 'topic,asc'>;
const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'createdAt,desc', label: 'Newest first' },
  { value: 'expectEnd,asc', label: 'Deadline' },
  { value: 'topic,asc', label: 'Name (A–Z)' },
];

export function ProjectListPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('createdAt,desc');
  const [page, setPage] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const debouncedSearch = useDebounce(search.trim());

  const { data, isLoading, error, refetch, isFetching } = useProjectPage({
    page,
    size: PAGE_SIZE.projects,
    sort,
    filters: compactFilters(debouncedSearch && projectFilters.topicContains(debouncedSearch)),
  });
  const deleteProject = useDeleteProject();
  const projects = data?.content ?? [];

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Projects"
        description={data ? `${data.meta.totalElements} project${data.meta.totalElements === 1 ? '' : 's'}` : 'Track your bigger goals'}
        actions={
          <Button icon={<Plus className="size-4" />} onClick={openCreate}>
            New project
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(0); }} placeholder="Search projects by topic…" />
        <Select label="Sort projects" value={sort} onChange={(v) => { setSort(v); setPage(0); }} options={sortOptions} />
      </div>

      {isLoading ? (
        <CardGridSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : projects.length === 0 ? (
        debouncedSearch ? (
          <EmptyState icon={<FolderKanban className="size-7" />} title="No matching projects" description={`Nothing found for “${debouncedSearch}”.`} action={<Button variant="secondary" onClick={() => setSearch('')}>Clear search</Button>} />
        ) : (
          <EmptyState
            icon={<FolderKanban className="size-7" />}
            title="No projects yet"
            description="Create a project to track a bigger goal with a deadline."
            action={<Button icon={<Plus className="size-4" />} onClick={openCreate}>Create your first project</Button>}
          />
        )
      ) : (
        <div className={isFetching ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onEdit={(proj) => {
                  setEditing(proj);
                  setFormOpen(true);
                }}
                onDelete={setDeleting}
              />
            ))}
          </div>
          {data && <Pagination meta={data.meta} onPageChange={setPage} />}
        </div>
      )}

      <ProjectFormModal open={formOpen} onClose={() => setFormOpen(false)} project={editing} />
      <ConfirmDialog
        open={!!deleting}
        title="Delete project?"
        message={
          <>
            <b className="text-slate-800">“{deleting?.topic}”</b> will be permanently deleted.
          </>
        }
        loading={deleteProject.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          deleteProject.mutate(deleting.id, {
            onSuccess: () => {
              setDeleting(null);
              if (projects.length === 1 && page > 0) setPage(page - 1);
            },
          })
        }
      />
    </>
  );
}
