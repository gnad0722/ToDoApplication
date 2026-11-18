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

  update: async (id: number, payload: Partial<ProjectPayload>) =>
    toProject(await unwrap(http.patch(`/api/project/${id}`, payload))),

  remove: (id: number) => unwrap<void>(http.delete(`/api/project/${id}`)),
};
