import { QueueProviderDTO } from '#/domain/services/dto/queue-provider.dto';

export interface IQueueProviderService {
    send(message: QueueProviderDTO): Promise<void>;
}
