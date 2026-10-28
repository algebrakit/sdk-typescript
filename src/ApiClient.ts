import axios, { AxiosInstance } from 'axios';
import {
  CreateSessionRequest,
  CreateSessionResponse,
  SessionScoreRequest,
  SessionScoreResponse,
  SessionLockRequest,
  SessionLockResponse,
  SessionInfoRequest,
  SessionInfoResponse,
  SessionRetrieveRequest,
  SessionRetrieveResponse,
  ExerciseValidateRequest,
  ExerciseValidateResponse,
  ExerciseInfoRequest,
  ExerciseInfoResponse,
} from './types/ApiTypes';
import { apiErrorMessage } from './utils/apiErrorMessage';

/** The Algebrakit API in the default region (Ireland). */
export const DEFAULT_BASE_URL = 'https://api.algebrakit.com';

/** Options for creating an {@link ApiClient}. */
export interface ApiClientOptions {
  /** Your Algebrakit API key. Keep it on your server; never send it to the browser. */
  apiKey: string;
  /** Base URL of the Algebrakit API. Defaults to {@link DEFAULT_BASE_URL}. */
  baseUrl?: string;
  /** Request timeout in milliseconds. Defaults to 30000. */
  timeout?: number;
}

/**
 * Client for the Algebrakit web service API.
 *
 * @example
 * const client = new ApiClient({ apiKey: process.env.ALGEBRAKIT_API_KEY! });
 */
export class ApiClient {
  private axiosInstance: AxiosInstance;

  /**
   * Creates a client for the Algebrakit API.
   * @param options The API key and, optionally, the base URL and timeout.
   */
  constructor(options: ApiClientOptions);
  /**
   * Creates a client for the Algebrakit API.
   * @param baseUrl The base URL of the Algebrakit API, for example {@link DEFAULT_BASE_URL}.
   * @param apiKey Your Algebrakit API key.
   */
  constructor(baseUrl: string, apiKey: string);
  constructor(optionsOrBaseUrl: ApiClientOptions | string, apiKey?: string) {
    const options: ApiClientOptions =
      typeof optionsOrBaseUrl === 'string' ? { baseUrl: optionsOrBaseUrl, apiKey: apiKey ?? '' } : optionsOrBaseUrl;

    this.axiosInstance = axios.create({
      baseURL: options.baseUrl ?? DEFAULT_BASE_URL,
      timeout: options.timeout ?? 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': options.apiKey,
      },
    });

    // Put the API's own error message in the error, for example
    // "Algebrakit API error 401: Could not validate credentials: the provided api-key is not valid"
    this.axiosInstance.interceptors.response.use(undefined, (error: unknown) => {
      if (axios.isAxiosError(error) && error.response) {
        error.message = `Algebrakit API error ${error.response.status}: ${apiErrorMessage(error.response.data)}`;
      }
      return Promise.reject(error);
    });
  }

  /**
   * Create new exercise sessions.
   * @param request The exercises to create sessions for. `apiVersion` defaults to 2.
   * @returns For each exercise, whether it succeeded and the created sessions.
   */
  public async createSession(request: CreateSessionRequest): Promise<CreateSessionResponse> {
    return this.axiosInstance
      .post<CreateSessionResponse>('/session/create', { apiVersion: 2, ...request })
      .then(r => r.data);
  }

  /**
   * Retrieve results from exercise sessions.
   * @param request The request payload for retrieving session scores.
   * @returns The response containing session scores.
   */
  public async getSessionScore(request: SessionScoreRequest): Promise<SessionScoreResponse> {
    return this.axiosInstance.post<SessionScoreResponse>('/session/score', request).then(r => r.data);
  }

  /**
   * Lock or unlock exercise sessions.
   * @param request The request payload for locking/unlocking sessions.
   * @returns The response confirming the action.
   */
  public async lockSession(request: SessionLockRequest): Promise<SessionLockResponse> {
    return this.axiosInstance.post<SessionLockResponse>('/sessions/lock', request).then(r => r.data);
  }

  /**
   * Retrieve detailed information about a session.
   * @param request The request payload for retrieving session information.
   * @returns The response containing session details.
   */
  public async getSessionInfo(request: SessionInfoRequest): Promise<SessionInfoResponse> {
    return this.axiosInstance.post<SessionInfoResponse>('/session/info', request).then(r => r.data);
  }

  /**
   * Retrieve existing sessions by their IDs.
   * @param request The request payload containing session IDs.
   * @returns The response containing session data for each ID.
   */
  public async retrieveSession(request: SessionRetrieveRequest): Promise<SessionRetrieveResponse> {
    return this.axiosInstance.post<SessionRetrieveResponse>('/session/retrieve', request).then(r => r.data);
  }

  /**
   * Validate an exercise definition or ID.
   * @param request The request payload for exercise validation.
   * @returns The response containing validation results and details.
   */
  public async validateExercise(request: ExerciseValidateRequest): Promise<ExerciseValidateResponse> {
    return this.axiosInstance.post<ExerciseValidateResponse>('/exercise/validate', request).then(r => r.data);
  }

  /**
   * Retrieve published information about an exercise (structure, versions, history).
   * @param request The request payload containing the exercise ID.
   * @returns The response containing published info about the exercise.
   */
  public async getExercisePublishedInfo(request: ExerciseInfoRequest): Promise<ExerciseInfoResponse> {
    return this.axiosInstance.post<ExerciseInfoResponse>('/exercise/published-info', request).then(r => r.data);
  }
}
