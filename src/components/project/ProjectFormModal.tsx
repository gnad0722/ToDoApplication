import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal, Textarea } from '@/components/ui';
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import { LIMITS, projectSchema, type ProjectForm } from '@/schemas';
import type { Project } from '@/types/models';
import { toApiDateTime, toInputDateTime } from '@/utils/date';

interface Props {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
}

export function ProjectFormModal({ open, onClose, project }: Props) {
  const isEdit = !!project;
  const create = useCreateProject();
  const update = useUpdateProject();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProjectForm>({ resolver: zodResolver(projectSchema) });

  useEffect(() => {
    if (open) {
      reset({
        topic: project?.topic ?? '',
        description: project?.description ?? '',
        startTime: toInputDateTime(project?.startTime),
        expectEnd: toInputDateTime(project?.expectEnd),
      });
    }
  }, [open, project, reset]);

  const onSubmit = (values: ProjectForm) => {
    const payload = {
      topic: values.topic.trim(),
      description: values.description.trim(),
      startTime: toApiDateTime(values.startTime),
      expectEnd: toApiDateTime(values.expectEnd),
    };
    if (isEdit) update.mutate({ id: project.id, payload }, { onSuccess: onClose });
    else create.mutate(payload, { onSuccess: onClose });
  };

  const pending = create.isPending || update.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit project' : 'New project'}
      description={isEdit ? undefined : 'Projects help you track bigger goals with a deadline.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="project-form" loading={pending}>
            {isEdit ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Topic"
          autoFocus
          placeholder="e.g. Launch personal website"
          error={errors.topic?.message}
          counter={{ value: watch('topic') ?? '', min: LIMITS.projectTopicMin }}
          {...register('topic')}
        />
        <Textarea
          label="Description"
          rows={4}
          placeholder="What is the goal of this project?"
          error={errors.description?.message}
          counter={{ value: watch('description') ?? '', min: LIMITS.projectDescriptionMin }}
          {...register('description')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Start time" type="datetime-local" error={errors.startTime?.message} {...register('startTime')} />
          <Input label="Expected end" type="datetime-local" error={errors.expectEnd?.message} {...register('expectEnd')} />
        </div>
      </form>
    </Modal>
  );
}
