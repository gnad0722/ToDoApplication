import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';
import { toast } from 'sonner';
import { toApiError } from './errors';

/**
 * Puts the field messages of a 400 validation error under the matching inputs.
 * Keys in the error's `data` are the JSON field names that were sent; `aliases`
 * maps one to a differently named form field.
 *
 * Returns true when at least one message was placed on a field. When the error
 * is a validation error but none of its fields exist in this form, its
 * `message` is shown as a toast (and true is returned). Other errors are left
 * untouched (returns false) so the caller decides how to show them.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly FieldPath<T>[],
  aliases: Record<string, FieldPath<T>> = {},
): boolean {
  const apiError = toApiError(error);
  if (!apiError.isValidation) return false;

  let applied = 0;
  for (const [key, message] of Object.entries(apiError.fieldErrors)) {
    const field = (aliases[key] ?? key) as FieldPath<T>;
    if (fields.includes(field)) {
      setError(field, { type: 'server', message }, { shouldFocus: applied === 0 });
      applied++;
    }
  }
  if (applied === 0) toast.error(apiError.message);
  return true;
}

/**
 * Default onError for mutation hooks. Validation errors are skipped because
 * the form shows them under its inputs (via applyServerErrors).
 */
export function notifyMutationError(error: unknown): void {
  const apiError = toApiError(error);
  if (apiError.isValidation) return;
  toast.error(apiError.message);
}
