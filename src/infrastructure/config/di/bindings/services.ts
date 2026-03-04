import { Container } from 'inversify';

import { ILogger } from '#/domain/services/logger.service';
import { IQueueProviderService } from '#/domain/services/queue-provider.service';
import { IStorageService } from '#/domain/services/storage.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { createPinoLogger } from '#/infrastructure/config/logger';
import { PinoLoggerService } from '#/infrastructure/services/pino-logger/pino-logger.service';
import { S3StorageService } from '#/infrastructure/services/s3/s3-storage.service';
import { SQSQueueProviderService } from '#/infrastructure/services/sqs/sqs-queue-provider.service';

export function bindServices(container: Container) {
    container.bind<IStorageService>(TYPES.StorageService).to(S3StorageService).inSingletonScope();
    container.bind<IQueueProviderService>(TYPES.QueueProviderService).to(SQSQueueProviderService).inSingletonScope();

    container
        .bind<ILogger>(TYPES.Logger)
        .toDynamicValue(() => {
            return new PinoLoggerService(createPinoLogger());
        })
        .inRequestScope();
}
