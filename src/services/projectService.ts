import type { PageQuery, PageResponse } from '@/types/api';
import type { ProjectPayload } from '@/types/models';
import { http, pageParams, unwrap } from './http';
import { mapPage, toProject } from './mappers';

export const projectService = {
  getMine: async (q: PageQuery) => {
    const page = await unwrap<PageResponse<Record<string, unknown>>>(
      http.get('/api/project/me', { params: pageParams(q, 'filter') }),
    );
    return mapPage(page, toProject);
  },

  getById: async (id: number) => toProject(await unwrap(http.get(`/api/project/${id}`))),

  create: async (payload: ProjectPayload) => toProject(await unwrap(http.post('/api/project/', payload))),

  /**
   * NOTE: the backend UpdateProjectDto spells the field `desription` (typo).
   * Both spellings are sent so this keeps working after the backend is fixed.
   */
  update: async (id: number, payload: Partial<ProjectPayload>) => {
    const body: Record<string, unknown> = { ...payload };
    if (payload.description !== undefined) body.desription = payload.description;
    return toProject(await unwrap(http.patch(`/api/project/${id}`, body)));
  },

  remove: (id: number) => unwrap<void>(http.delete(`/api/project/${id}`)),
};
