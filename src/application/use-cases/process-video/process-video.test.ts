import { Mocked } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockLogger } from '#/__tests__/mocks/services/mock-logger.service';
import { createMockQueueProviderService } from '#/__tests__/mocks/services/mock-queue-provider.service';
import { createMockStorageService } from '#/__tests__/mocks/services/mock-storage.service';
import { createMockVideoExtractorService } from '#/__tests__/mocks/services/mock-video-extractor.service';
import { createMockZipService } from '#/__tests__/mocks/services/mock-zip.service';
import { ProcessVideoUseCase } from '#/application/use-cases/process-video/process-video';
import { IProcessVideoUseCase } from '#/application/use-cases/process-video/process-video.use-case';
import { EventType } from '#/domain/enum/event-type';
import { ILogger } from '#/domain/services/logger.service';
import { IQueueProviderService } from '#/domain/services/queue-provider.service';
import { IStorageService } from '#/domain/services/storage.service';
import { IVideoExtractorService } from '#/domain/services/video-extractor.service';
import { IZipService } from '#/domain/services/zip.service';

vi.mock('crypto', () => ({
    randomUUID: vi.fn(() => 'mock-uuid'),
}));

vi.mock('os', () => ({
    tmpdir: vi.fn(() => '/tmp'),
}));

vi.mock('fs', () => ({
    createWriteStream: vi.fn(() => 'mock-write-stream'),
    createReadStream: vi.fn(() => 'mock-read-stream'),
}));

vi.mock('fs/promises', () => ({
    mkdir: vi.fn(),
    readdir: vi.fn(),
    rm: vi.fn(),
    stat: vi.fn(),
}));

vi.mock('stream/promises', () => ({
    pipeline: vi.fn(),
}));

// eslint-disable-next-line import/order
import { mkdir, readdir, rm, stat } from 'fs/promises';
// eslint-disable-next-line import/order
import { createReadStream } from 'fs';
// eslint-disable-next-line import/order
import { Readable } from 'stream';

const mockedMkdir = vi.mocked(mkdir);
const mockedReaddir = vi.mocked(readdir);
const mockedRm = vi.mocked(rm);
const mockedStat = vi.mocked(stat);

describe('ProcessVideoUseCase', () => {
    let sut: IProcessVideoUseCase;
    let mockLogger: Mocked<ILogger>;
    let mockStorageService: Mocked<IStorageService>;
    let mockVideoExtractorService: Mocked<IVideoExtractorService>;
    let mockZipService: Mocked<IZipService>;
    let mockQueueProviderService: Mocked<IQueueProviderService>;

    const request = { jobId: 'job-123', key: 'processing/video.mp4', eventType: 'PROCESSING' };

    beforeEach(() => {
        vi.clearAllMocks();

        mockLogger = createMockLogger();
        mockStorageService = createMockStorageService();
        mockVideoExtractorService = createMockVideoExtractorService();
        mockZipService = createMockZipService();
        mockQueueProviderService = createMockQueueProviderService();

        sut = new ProcessVideoUseCase(
            mockLogger,
            mockStorageService,
            mockVideoExtractorService,
            mockZipService,
            mockQueueProviderService,
        );

        mockedMkdir.mockResolvedValue(undefined);
        mockedRm.mockResolvedValue(undefined);
        mockedReaddir.mockResolvedValue(['frame_0001.png', 'frame_0002.png', 'frame_0003.png'] as any);
        mockedStat.mockResolvedValue({ size: 4096 } as any);

        mockStorageService.download.mockResolvedValue(Readable.from(Buffer.from('fake-video')));
        mockVideoExtractorService.execute.mockResolvedValue('/tmp/frames-mock-uuid');
        mockZipService.execute.mockResolvedValue('/tmp/zip-mock-uuid.zip');
        mockStorageService.upload.mockResolvedValue(undefined);
        mockQueueProviderService.send.mockResolvedValue(undefined);
    });

    it('should process video successfully end-to-end', async () => {
        await sut.execute(request);

        expect(mockStorageService.download).toHaveBeenCalledWith('processing/video.mp4');
        expect(mockVideoExtractorService.execute).toHaveBeenCalledWith('/tmp/video-mock-uuid/input.mp4');
        expect(mockedReaddir).toHaveBeenCalledWith('/tmp/frames-mock-uuid');
        expect(mockZipService.execute).toHaveBeenCalledWith('/tmp/frames-mock-uuid');
        expect(mockStorageService.upload).toHaveBeenCalledWith(
            expect.objectContaining({
                key: 'output/job-123/frames.zip',
                contentType: 'application/zip',
                contentLength: 4096,
            }),
        );
        expect(mockQueueProviderService.send).toHaveBeenCalledWith({
            jobId: 'job-123',
            eventType: EventType.DONE,
            zipKey: 'output/job-123/frames.zip',
            frameCount: 3,
        });
    });

    it('should send correct zip key format', async () => {
        const customRequest = { jobId: 'custom-job-456', key: 'processing/clip.mp4', eventType: 'PROCESSING' };

        await sut.execute(customRequest);

        expect(mockStorageService.upload).toHaveBeenCalledWith(
            expect.objectContaining({
                key: 'output/custom-job-456/frames.zip',
            }),
        );
    });

    it('should only count .png files as frames', async () => {
        mockedReaddir.mockResolvedValue(['frame_0001.png', 'frame_0002.png', 'thumbs.db', '.DS_Store'] as any);

        await sut.execute(request);

        expect(mockQueueProviderService.send).toHaveBeenCalledWith(
            expect.objectContaining({
                frameCount: 2,
            }),
        );
    });

    it('should send ERROR event and re-throw on failure', async () => {
        const downloadError = new Error('S3 download failed');
        mockStorageService.download.mockRejectedValue(downloadError);

        await expect(sut.execute(request)).rejects.toThrow('S3 download failed');

        expect(mockQueueProviderService.send).toHaveBeenCalledWith({
            jobId: 'job-123',
            eventType: EventType.ERROR,
            error: 'S3 download failed',
        });
    });

    it('should clean up temp directory on success', async () => {
        await sut.execute(request);

        expect(mockedRm).toHaveBeenCalledWith('/tmp/video-mock-uuid', { recursive: true, force: true });
    });

    it('should clean up temp directory even on failure', async () => {
        mockStorageService.download.mockRejectedValue(new Error('fail'));

        await expect(sut.execute(request)).rejects.toThrow();

        expect(mockedRm).toHaveBeenCalledWith('/tmp/video-mock-uuid', { recursive: true, force: true });
    });

    it('should use createReadStream for zip upload', async () => {
        await sut.execute(request);

        expect(createReadStream).toHaveBeenCalledWith('/tmp/zip-mock-uuid.zip');
        expect(mockStorageService.upload).toHaveBeenCalledWith(
            expect.objectContaining({
                body: 'mock-read-stream',
            }),
        );
    });
});
