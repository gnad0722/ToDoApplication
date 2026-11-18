/**
 * Builders for the backend `filters` / `filter` query parameters.
 *
 * Syntax (see backend FilterSpecification): `field:OPERATOR:value`
 *   GET /api/task/todo/1?page=0&size=20&sort=expectStart,asc&filters=isDone:EQ:false
 *
 * - Every filter MUST have three parts, even IS_NULL / IS_NOT_NULL (value is ignored).
 * - The value may itself contain ':' (the backend splits on the first two only).
 * - CONTAINS / STARTS_WITH / ENDS_WITH are case-insensitive.
 * - Date-time values use ISO `LocalDateTime` format: 2026-11-18T09:00:00.
 * - Only whitelisted fields are accepted; anything else returns 400 "Invalid filter: ...".
 */

export type FilterOperator =
  | 'EQ'
  | 'NOT_EQ'
  | 'CONTAINS'
  | 'STARTS_WITH'
  | 'ENDS_WITH'
  | 'GT'
  | 'GTE'
  | 'LT'
  | 'LTE'
  | 'IS_NULL'
  | 'IS_NOT_NULL';

/** Filterable fields per resource, mirroring the backend whitelists. */
export type TodoFilterField = 'topic' | 'startTime' | 'numTask' | 'numCompleteTask';
export type TaskFilterField = 'name' | 'description' | 'isDone' | 'expectStart' | 'expectEnd';
export type ProjectFilterField = 'topic' | 'description' | 'startTime' | 'expectEnd' | 'numTask' | 'numCompleteTask';

export type FilterValue = string | number | boolean;

/** Sortable fields per resource (entity properties). Format: "field,asc|desc". */
type Dir = 'asc' | 'desc';
type Audit = 'id' | 'createdAt' | 'lastModifiedAt';
export type TodoSort = `${TodoFilterField | Audit},${Dir}`;
export type TaskSort = `${TaskFilterField | Audit},${Dir}`;
export type ProjectSort = `${ProjectFilterField | Audit},${Dir}`;

export function buildFilter<F extends string>(field: F, operator: FilterOperator, value: FilterValue = ''): string {
  return `${field}:${operator}:${value}`;
}

/** Typed shortcuts, e.g. `filter.eq<TaskFilterField>('isDone', false)`. */
export const filter = {
  eq: <F extends string>(field: F, value: FilterValue) => buildFilter(field, 'EQ', value),
  notEq: <F extends string>(field: F, value: FilterValue) => buildFilter(field, 'NOT_EQ', value),
  contains: <F extends string>(field: F, value: string) => buildFilter(field, 'CONTAINS', value),
  startsWith: <F extends string>(field: F, value: string) => buildFilter(field, 'STARTS_WITH', value),
  gt: <F extends string>(field: F, value: FilterValue) => buildFilter(field, 'GT', value),
  gte: <F extends string>(field: F, value: FilterValue) => buildFilter(field, 'GTE', value),
  lt: <F extends string>(field: F, value: FilterValue) => buildFilter(field, 'LT', value),
  lte: <F extends string>(field: F, value: FilterValue) => buildFilter(field, 'LTE', value),
  isNull: <F extends string>(field: F) => buildFilter(field, 'IS_NULL'),
  isNotNull: <F extends string>(field: F) => buildFilter(field, 'IS_NOT_NULL'),
};

/** Ready-made filters used by the pages, so field names live in one place. */
export const todoFilters = {
  topicContains: (q: string) => filter.contains<TodoFilterField>('topic', q),
};
export const taskFilters = {
  done: (done: boolean) => filter.eq<TaskFilterField>('isDone', done),
};
export const projectFilters = {
  topicContains: (q: string) => filter.contains<ProjectFilterField>('topic', q),
};

/** Keeps only defined, non-empty filter strings. */
export function compactFilters(...filters: Array<string | false | null | undefined>): string[] {
  return filters.filter((f): f is string => typeof f === 'string' && f.length > 0);
}
