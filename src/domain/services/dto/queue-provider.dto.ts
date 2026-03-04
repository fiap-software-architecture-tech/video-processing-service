import { EventType } from '#/domain/enum/event-type';

export interface QueueProviderDTO {
    jobId: string;
    eventType: EventType;
    zipKey?: string;
    error?: string;
}
