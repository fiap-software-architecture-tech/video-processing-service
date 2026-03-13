import { Mocked, vi } from 'vitest';

import { IZipService } from '#/domain/services/zip.service';

export const createMockZipService = (): Mocked<IZipService> => ({
    execute: vi.fn(),
});
