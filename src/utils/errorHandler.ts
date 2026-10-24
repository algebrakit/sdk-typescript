import { AxiosError } from 'axios';

/**
 * Handles errors from Axios requests and provides a standardized error message.
 * @param error The Axios error object.
 * @returns A standardized error message.
 */
export function handleApiError(error: AxiosError): string {
  if (error.response) {
    // Server responded with a status code outside the 2xx range.
    // The response body is usually a parsed object, so serialize it
    // instead of letting it coerce to "[object Object]".
    const body =
      typeof error.response.data === 'string'
        ? error.response.data
        : JSON.stringify(error.response.data);
    return `API Error: ${error.response.status} - ${body}`;
  } else if (error.request) {
    // Request was made but no response was received
    return 'API Error: No response received from the server.';
  } else {
    // Something happened in setting up the request
    return `API Error: ${error.message}`;
  }
}