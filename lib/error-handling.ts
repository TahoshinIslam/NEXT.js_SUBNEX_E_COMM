// Custom Error Handling Utilities for Subnex
// Based on Next.js internal error handling patterns

/**
 * Error type for unhandled promise rejections or console.error calls
 * These errors are captured and displayed in the Error Overlay
 */
export type UnhandledError = Error & { 
  digest?: string;
  [key: string]: unknown;
};

/**
 * Console entry types for error logging
 */
export type ConsoleEntryType = 'log' | 'warn' | 'error' | 'info' | 'debug';

/**
 * Console entry structure for storing error-related console output
 */
export interface ConsoleEntry {
  type: ConsoleEntryType;
  args: unknown[];
  timestamp: number;
}

/**
 * Progress callback type for long-running operations
 */
export type ProgressCallback = (progress: number, message?: string) => void;

/**
 * Progress tracker state
 */
export interface ProgressState {
  current: number;
  total: number;
  message?: string;
  startedAt: number;
  completedAt?: number;
}

// Error digest constant
const NEXT_UNHANDLED_ERROR = 'NEXT_UNHANDLED_ERROR';

/**
 * Creates a non-Error shape unhandled promise rejection or console.error error
 * @param message - The error message
 * @returns An error with digest property for identification
 */
export function createUnhandledError(message: string): UnhandledError {
  const error = new Error(message) as UnhandledError;
  error.digest = NEXT_UNHANDLED_ERROR;
  return error;
}

/**
 * Checks if an error is an unhandled console or rejection error
 * @param error - The error to check
 * @returns True if the error has the unhandled error digest
 */
export function isUnhandledConsoleOrRejection(error: unknown): error is UnhandledError {
  if (!error || typeof error !== 'object') return false;
  const err = error as Record<string, unknown>;
  return err.digest === NEXT_UNHANDLED_ERROR;
}

/**
 * Client error handler for managing client-side errors
 */
class ClientErrorHandler {
  private errorQueue: UnhandledError[] = [];
  private errorHandlers: Array<(error: UnhandledError) => void> = [];
  private rejectionQueue: UnhandledError[] = [];
  private rejectionHandlers: Array<(error: UnhandledError) => void> = [];

  /**
   * Handles a client-side error
   * @param originError - The original error
   * @param consoleErrorArgs - Console arguments if it's a console.error call
   */
  handleClientError(originError: unknown, consoleErrorArgs: unknown[] = []): UnhandledError {
    let error: UnhandledError;

    if (!originError || !(originError instanceof Error)) {
      // If it's not an error, format the args into an error
      const formattedErrorMessage = resolveConsoleEntry(consoleErrorArgs);
      error = createUnhandledError(formattedErrorMessage);
    } else {
      error = originError as UnhandledError;
    }

    // Queue the error for handlers
    this.errorQueue.push(error);
    
    // Notify all registered handlers
    for (const handler of this.errorHandlers) {
      handler(error);
    }

    return error;
  }

  /**
   * Handles an unhandled promise rejection
   * @param reason - The rejection reason
   */
  handleRejection(reason: unknown): UnhandledError {
    let error: UnhandledError;

    if (reason && !(reason instanceof Error)) {
      error = createUnhandledError(String(reason));
    } else {
      error = reason as UnhandledError;
    }

    this.rejectionQueue.push(error);
    
    for (const handler of this.rejectionHandlers) {
      handler(error);
    }

    return error;
  }

  /**
   * Registers an error handler
   * @param handler - The handler function to register
   * @returns Cleanup function to remove the handler
   */
  onError(handler: (error: UnhandledError) => void): () => void {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Registers a rejection handler
   * @param handler - The handler function to register
   * @returns Cleanup function to remove the handler
   */
  onRejection(handler: (error: UnhandledError) => void): () => void {
    this.rejectionHandlers.push(handler);
    return () => {
      const index = this.rejectionHandlers.indexOf(handler);
      if (index > -1) {
        this.rejectionHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Gets all queued errors
   */
  getQueuedErrors(): UnhandledError[] {
    return [...this.errorQueue];
  }

  /**
   * Gets all queued rejections
   */
  getQueuedRejections(): UnhandledError[] {
    return [...this.rejectionQueue];
  }

  /**
   * Clears the error queues
   */
  clearQueues(): void {
    this.errorQueue = [];
    this.rejectionQueue = [];
  }
}

// Singleton instance
export const clientErrorHandler = new ClientErrorHandler();

/**
 * Resolves console arguments into a formatted error message string
 * @param args - Console arguments
 * @returns Formatted message string
 */
export function resolveConsoleEntry(args: unknown[]): string {
  if (!args || args.length === 0) {
    return 'Unknown error';
  }

  return args.map(arg => {
    if (arg === undefined) return 'undefined';
    if (arg === null) return 'null';
    if (typeof arg === 'string') return arg;
    if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
    if (arg instanceof Error) return arg.message;
    
    try {
      return JSON.stringify(arg);
    } catch {
      return String(arg);
    }
  }).join(' ');
}

/**
 * Processes a full string row of error data
 * @param row - The string row data
 * @returns Processed data
 */
export function processFullStringRow(row: string): Record<string, string> {
  const result: Record<string, string> = {};
  
  if (!row || typeof row !== 'string') {
    return result;
  }

  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(row);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, string>;
    }
  } catch {
    // Not JSON, treat as key=value pairs
    const pairs = row.split(/[,\n]/);
    for (const pair of pairs) {
      const [key, ...valueParts] = pair.split('=');
      if (key && valueParts.length > 0) {
        result[key.trim()] = valueParts.join('=').trim();
      }
    }
  }

  return result;
}

/**
 * Processes a full binary row of error data
 * @param row - The binary row data
 * @returns Processed data
 */
export function processFullBinaryRow(row: ArrayBuffer | Uint8Array): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (!row) {
    return result;
  }

  try {
    // Convert binary to string
    let data: Uint8Array;
    if (row instanceof ArrayBuffer) {
      data = new Uint8Array(row);
    } else {
      data = row;
    }

    // Try to decode as UTF-8
    const text = new TextDecoder().decode(data);
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch {
      // Return as raw string
      return { raw: text };
    }
  } catch {
    return { error: 'Failed to process binary data' };
  }
}

/**
 * Progress tracker for long-running operations
 */
class ProgressTracker {
  private states: Map<string, ProgressState> = new Map();

  /**
   * Creates a new progress tracker
   * @param id - Unique identifier
   * @param total - Total number of items
   * @param message - Initial message
   */
  create(id: string, total: number, message?: string): ProgressState {
    const state: ProgressState = {
      current: 0,
      total,
      message,
      startedAt: Date.now(),
    };
    this.states.set(id, state);
    return state;
  }

  /**
   * Updates progress for an operation
   * @param id - Unique identifier
   * @param current - Current progress value
   * @param message - Optional message
   */
  update(id: string, current: number, message?: string): ProgressState | null {
    const state = this.states.get(id);
    if (!state) return null;

    state.current = Math.min(current, state.total);
    if (message) {
      state.message = message;
    }

    if (state.current >= state.total) {
      state.completedAt = Date.now();
    }

    this.states.set(id, state);
    return state;
  }

  /**
   * Gets progress state
   * @param id - Unique identifier
   */
  get(id: string): ProgressState | null {
    return this.states.get(id) || null;
  }

  /**
   * Gets progress percentage
   * @param id - Unique identifier
   */
  getPercentage(id: string): number {
    const state = this.states.get(id);
    if (!state || state.total === 0) return 0;
    return Math.round((state.current / state.total) * 100);
  }

  /**
   * Checks if an operation is complete
   * @param id - Unique identifier
   */
  isComplete(id: string): boolean {
    const state = this.states.get(id);
    return state?.completedAt !== undefined;
  }

  /**
   * Gets duration of an operation in milliseconds
   * @param id - Unique identifier
   */
  getDuration(id: string): number | null {
    const state = this.states.get(id);
    if (!state) return null;

    const endTime = state.completedAt || Date.now();
    return endTime - state.startedAt;
  }

  /**
   * Removes a progress tracker
   * @param id - Unique identifier
   */
  remove(id: string): void {
    this.states.delete(id);
  }

  /**
   * Clears all progress trackers
   */
  clear(): void {
    this.states.clear();
  }
}

// Singleton instance
export const progress = new ProgressTracker();

/**
 * Error class for Subnex-specific errors
 */
export class SubnexError extends Error {
  code: string;
  details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = 'SubnexError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Error types for Subnex application
 */
export const ErrorCodes = {
  CLIENT_NOT_FOUND: 'CLIENT_NOT_FOUND',
  SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
  SERVICE_NOT_FOUND: 'SERVICE_NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EMAIL_ERROR: 'EMAIL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Creates a Subnex-specific error
 * @param message - Error message
 * @param code - Error code
 * @param details - Additional error details
 */
export function createError(
  message: string,
  code: ErrorCode = ErrorCodes.UNKNOWN_ERROR,
  details?: unknown
): SubnexError {
  return new SubnexError(message, code, details);
}

/**
 * Formats error for display in UI
 * @param error - Error to format
 * @returns Formatted error object
 */
export function formatError(error: unknown): {
  message: string;
  code?: string;
  details?: unknown;
} {
  if (error instanceof SubnexError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: String(error),
  };
}
