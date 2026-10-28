// Request types for the Algebrakit Webservice API

import { IAK_Exercise } from '../exercise/AK_ExerciseTypes';

/** How much feedback a student receives on their answers. */
export type AK_StudentFeedbackType = 'ALL' | 'ICONS_ONLY' | 'ERRORS_ONLY' | 'NONE';

export interface CreateSessionOptions {
  validate?: boolean;
  productionMode?: boolean;
  /** Include debug information about the item in the response. */
  generateDebugInfo?: boolean;
}

export interface CreateSessionRequest {
  /**
   * The exercises to create sessions for. Identify each exercise in one of three ways:
   * - `exerciseId` (and optionally `version`): an exercise created in the Algebrakit CMS;
   * - `exerciseSpec`: a JSON specification of the exercise;
   * - `sessionId`: reuse the exercise of an existing session, for example to create identical sessions from a random exercise.
   */
  exercises: Array<{
    /** Unique identifier of an exercise created in the Algebrakit CMS. */
    exerciseId?: string;
    /** Version of the exercise, or `'latest'` (the default) for the most recent version. */
    version?: string;
    /** JSON specification of the exercise, for example in the AK_Exercise format. */
    exerciseSpec?: IAK_Exercise | Record<string, unknown>;
    /** Identifier of an existing session whose exercise to reuse. */
    sessionId?: string;
    /** Number of sessions to create from `sessionId`. */
    nr?: number;
  }>;
  options?: CreateSessionOptions;
  /** Reference to a predefined scoring model. */
  scoringModel?: string;
  /** Turns off step-by-step evaluation, hints and feedback for the student. */
  assessmentMode?: boolean;
  /** Prevents obtaining the solution before the session is locked. */
  requireLockForSolution?: boolean;
  /** How much feedback the student receives on their answers. Defaults to `'ALL'`. */
  studentFeedbackType?: AK_StudentFeedbackType;
  /** API version. The SDK sets this to 2; you don't need to pass it. */
  apiVersion?: 2;
}

export interface SessionScoreRequest {
  sessionId: string;
  /** Lock the session, so that the student can't change it anymore. */
  lockSession?: boolean;
}

export interface SessionLockRequest {
  action: 'LOCK' | 'UNLOCK' | 'FINALIZE';
  sessionIds: string[];
}

export interface SessionInfoRequest {
  sessionId: string;
}

export interface SessionRetrieveRequest {
  sessionIds: string[];
}

export interface ExerciseValidateRequest {
  exerciseId?: string;
  version?: string | number;
  exerciseSpec?: IAK_Exercise | Record<string, unknown>;
}

export interface ExerciseInfoRequest {
  id: string;
}
