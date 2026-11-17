import { CalendarRange, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, DropdownMenu, ProgressBar } from '@/components/ui';
import { paths } from '@/routes/paths';
import type { Project } from '@/types/models';
import { formatDate } from '@/utils/date';
import { DeadlineBadge } from './DeadlineBadge';

interface Props {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: Props) {
  const completed = project.numTask > 0 && project.numCompleteTask === project.numTask;

  return (
    <Link to={paths.projectDetail(project.id)} className="group block">
      <Card className="flex h-full flex-col p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-brand-200 group-hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <DeadlineBadge expectEnd={project.expectEnd} completed={completed} />
            <h3 className="mt-2 line-clamp-1 font-semibold text-slate-900 group-hover:text-brand-700">{project.topic}</h3>
          </div>
          <DropdownMenu
            items={[
              { label: 'Edit', icon: <Pencil className="size-4" />, onClick: () => onEdit(project) },
              { label: 'Delete', icon: <Trash2 className="size-4" />, onClick: () => onDelete(project), danger: true },
            ]}
          />
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.description}</p>
        <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
          <CalendarRange className="size-3.5" />
          {formatDate(project.startTime, 'No start')} → {formatDate(project.expectEnd, 'No deadline')}
        </div>
        <div className="mt-auto pt-5">
          {project.numTask > 0 ? <ProgressBar done={project.numCompleteTask} total={project.numTask} /> : <p className="text-xs text-slate-400">No tasks linked yet</p>}
        </div>
      </Card>
    </Link>
  );
}
