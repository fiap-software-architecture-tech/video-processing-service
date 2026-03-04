import { inject, injectable } from 'inversify';

import { IProcessVideoUseCase } from '#/application/use-cases/process-video/process-video.use-case';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';

@injectable()
export class ProcessVideoUseCase implements IProcessVideoUseCase {
    constructor(@inject(TYPES.Logger) private readonly logger: ILogger) {}

    async execute(request: any): Promise<any> {
        this.logger.info('Executing video processing use case', { request });

        const { jobId, key } = request;
    }
}
