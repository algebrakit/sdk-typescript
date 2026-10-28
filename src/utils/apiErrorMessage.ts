/**
 * Extracts the error message from an Algebrakit API error response body,
 * for example `{"success":false,"error":"Could not validate credentials: ..."}`.
 */
export function apiErrorMessage(data: unknown): string {
  if (data && typeof data === 'object') {
    const body = data as { error?: unknown; msg?: unknown; message?: unknown };
    const message = body.error ?? body.msg ?? body.message;
    return typeof message === 'string' ? message : JSON.stringify(data);
  }
  return data === undefined || data === '' ? 'no response body' : String(data);
}
