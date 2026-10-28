// Response types for the Algebrakit Webservice API
import { InteractionType, InteractionScoring, TagDescription, QuestionResult, ElementInfo, InteractionDescription, SessionData } from '../shared/SharedTypes';

export type CreateSessionResponse = Array<{
  success: boolean;
  msg?: string;
  sessions: Array<SessionData>;
}>;

export interface SessionScoreResponse {
  questions: Array<QuestionResult>;
  tagDescriptions: Record<string, TagDescription>;
  scoring: InteractionScoring;
}

export interface SessionLockResponse {}

export interface SessionInfoResponse {
  success?: boolean;
  /** When the session was created, as a Unix timestamp in seconds. */
  creationTimestamp?: number;
  elements: Array<ElementInfo>;
  tagDescriptions: Record<string, TagDescription>;
  scoring?: InteractionScoring;
}

export type SessionRetrieveResponse = Array<SessionData>;

export interface ExerciseValidateResponse {
  success: boolean;
  valid: boolean;
  msg?: string;
  marks?: number;
  random?: boolean;
  interactions?: Record<string, InteractionDescription>;
}

export interface ExerciseInfoResponse {
  commitHistory: ExerciseInfoCommitData[];
  id: string;
  publishedVersions: ExerciseInfoPublishedVersion[];
  courseName: string;
  type: string;
}

export interface ExerciseInfoCommitData {
  versionNumber: string;
  commitDate: string;
  commitMessage: string;
  authorUsername: string;
}

export interface ExerciseInfoPublishedVersion {
  name: string;
  majorVersion: number | 'latest';
  minorVersion: number;
  metadata: Record<string, string>;
  numberOfLevels?: number;
  interactions: ExerciseInfoInteraction[];
  resources: ExerciseInfoResource[];
}

export interface ExerciseInfoInteraction {
  block: string;
  refId: string;
  type: string;
  refName: string;
}

export interface ExerciseInfoResource {
  refId: string;
  type: string;
  refName: string;
}
