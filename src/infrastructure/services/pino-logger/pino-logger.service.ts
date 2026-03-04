import { Logger } from 'pino';

import { ILogger } from '#/domain/services/logger.service';

export class PinoLoggerService implements ILogger {
    constructor(private readonly logger: Logger) {}

    info(message: string, context?: Record<string, any>): void {
        this.logger.info(context || {}, message);
    }

    error(message: string, error?: Error, context?: Record<string, any>): void {
        this.logger.error({ context, err: error }, message);
    }

    warn(message: string, context?: Record<string, any>): void {
        this.logger.warn(context || {}, message);
    }

    debug(message: string, context?: Record<string, any>): void {
        this.logger.debug(context || {}, message);
    }
}
