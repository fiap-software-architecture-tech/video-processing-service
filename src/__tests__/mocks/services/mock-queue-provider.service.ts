import { Mocked, vi } from 'vitest';

import { IQueueProviderService } from '#/domain/services/queue-provider.service';

export const createMockQueueProviderService = (): Mocked<IQueueProviderService> => ({
    send: vi.fn(),
});
