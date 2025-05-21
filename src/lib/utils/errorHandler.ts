import { Logger } from '../logger';

export class ErrorHandler {
  static handle(error: unknown, fallbackMessage: string, context = 'GLOBAL'): string {
    const message = error instanceof Error ? error.message : String(error);
    Logger.error(`[${context}] ${message}`);
    return fallbackMessage;
  }
}
