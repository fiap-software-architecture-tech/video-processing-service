import { Mocked, vi } from 'vitest';

import { IStorageService } from '#/domain/services/storage.service';

export const createMockStorageService = (): Mocked<IStorageService> => ({
    upload: vi.fn(),
    download: vi.fn(),
});
