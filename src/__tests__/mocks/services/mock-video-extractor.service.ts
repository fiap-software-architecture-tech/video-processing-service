import { Mocked, vi } from 'vitest';

import { IVideoExtractorService } from '#/domain/services/video-extractor.service';

export const createMockVideoExtractorService = (): Mocked<IVideoExtractorService> => ({
    execute: vi.fn(),
});
