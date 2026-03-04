import { EventType } from '#/domain/enum/event-type';

export interface QueueProviderDTO {
    jobId: string;
    key: string;
    eventType: EventType;
}
