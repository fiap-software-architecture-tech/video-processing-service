import { Mocked, vi } from 'vitest';

import { ILogger } from '#/domain/services/logger.service';

export const createMockLogger = (): Mocked<ILogger> => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
});
