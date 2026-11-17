import axios from 'axios';

/** Standard error type thrown by every service call. */
export class ApiError extends Error {
  readonly status?: number;
  readonly details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function defaultMessage(status: number): string {
  if (status === 401) return 'Your session has expired. Please log in again.';
  if (status === 403) return 'You do not have permission to do this.';
  if (status === 404) return 'The requested resource was not found.';
  if (status >= 500) return 'Something went wrong on the server. Please try again later.';
  return 'Request failed.';
}

/** Converts anything thrown (axios error, ApiError, unknown) into an ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ApiError('Cannot reach the server. Check your connection or that the backend is running.');
    }
    const { status, data } = error.response;
    const body = data as { message?: string; data?: unknown; error?: string } | undefined;
    const message = body?.message || body?.error || defaultMessage(status);
    return new ApiError(message, status, body?.data);
  }

  if (error instanceof Error) return new ApiError(error.message);
  return new ApiError('Unexpected error.');
}

export function getErrorMessage(error: unknown): string {
  return toApiError(error).message;
}
