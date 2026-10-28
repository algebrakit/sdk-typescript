import axios from 'axios';
import { apiErrorMessage } from './apiErrorMessage';

/**
 * Turns an error from an {@link ApiClient} call into a readable message.
 * @param error The error thrown by an `ApiClient` method.
 * @returns A message such as `API Error: 401 - Could not validate credentials: the provided api-key is not valid`.
 */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      return `API Error: ${error.response.status} - ${apiErrorMessage(error.response.data)}`;
    }
    if (error.request) {
      // Request was made but no response was received (network error or timeout)
      return `API Error: No response received from the server (${error.message}).`;
    }
  }
  // Something happened in setting up the request
  return `API Error: ${error instanceof Error ? error.message : String(error)}`;
}
