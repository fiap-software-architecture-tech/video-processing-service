import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { inject, injectable } from 'inversify';

import { QueueProviderDTO } from '#/domain/services/dto/queue-provider.dto';
import { ILogger } from '#/domain/services/logger.service';
import { IQueueProviderService } from '#/domain/services/queue-provider.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { env } from '#/infrastructure/config/env';

@injectable()
export class SQSQueueProviderService implements IQueueProviderService {
    private sqsClient: SQSClient;

    constructor(@inject(TYPES.Logger) private readonly logger: ILogger) {
        this.sqsClient = new SQSClient({
            region: env.AWS_REGION,
            endpoint: env.AWS_ENDPOINT,
        });
    }

    async send(message: QueueProviderDTO): Promise<void> {
        await this.sqsClient.send(
            new SendMessageCommand({
                QueueUrl: env.AWS_SQS_URL,
                MessageBody: JSON.stringify(message),
                MessageAttributes: {
                    eventType: {
                        DataType: 'String',
                        StringValue: message.eventType,
                    },
                },
            }),
        );
    }
}
