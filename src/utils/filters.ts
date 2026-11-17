/**
 * Builders for the backend `filter` / `filters` query parameters.
 *
 * The OpenAPI document only says they are arrays of strings, not their syntax.
 * The format is ASSUMED to be "field:value" (or "field:operator:value").
 * If the backend expects a different syntax, change ONLY this file.
 */
export type FilterOperator = 'like' | 'eq';

export function buildFilter(field: string, value: string | number | boolean, operator?: FilterOperator): string {
  return operator ? `${field}:${operator}:${value}` : `${field}:${value}`;
}

/** Keeps only defined, non-empty filter strings. */
export function compactFilters(...filters: Array<string | false | null | undefined>): string[] {
  return filters.filter((f): f is string => typeof f === 'string' && f.length > 0);
}
