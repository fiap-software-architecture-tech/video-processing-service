import { randomUUID } from 'crypto';
import { createReadStream, createWriteStream } from 'fs';
import { mkdir, readdir, rm, stat } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { pipeline } from 'stream/promises';

import { inject, injectable } from 'inversify';

import { IProcessVideoUseCase } from '#/application/use-cases/process-video/process-video.use-case';
import { EventType } from '#/domain/enum/event-type';
import { ILogger } from '#/domain/services/logger.service';
import { IQueueProviderService } from '#/domain/services/queue-provider.service';
import { IStorageService } from '#/domain/services/storage.service';
import { IVideoExtractorService } from '#/domain/services/video-extractor.service';
import { IZipService } from '#/domain/services/zip.service';
import { TYPES } from '#/infrastructure/config/di/types';

@injectable()
export class ProcessVideoUseCase implements IProcessVideoUseCase {
    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.StorageService) private readonly storageService: IStorageService,
        @inject(TYPES.VideoExtractorService) private readonly videoExtractorService: IVideoExtractorService,
        @inject(TYPES.ZipService) private readonly zipService: IZipService,
        @inject(TYPES.QueueProviderService) private readonly queueProviderService: IQueueProviderService,
    ) {}

    async execute(request: any): Promise<void> {
        const workDir = join(tmpdir(), `video-${randomUUID()}`);
        const videoPath = join(workDir, 'input.mp4');

        try {
            this.logger.info('Starting video processing', { request });

            await mkdir(workDir, { recursive: true });

            const stream = await this.storageService.download(request.key);
            await pipeline(stream, createWriteStream(videoPath));

            const framesDir = await this.videoExtractorService.execute(videoPath);

            // Count frames
            const frameFiles = await readdir(framesDir);
            const frameCount = frameFiles.filter(f => f.endsWith('.png')).length;
            this.logger.info('Frames extracted', { frameCount });

            const zipPath = await this.zipService.execute(framesDir);

            const zipKey = `output/${request.jobId}/frames.zip`;
            const zipStats = await stat(zipPath);

            await this.storageService.upload({
                key: zipKey,
                body: createReadStream(zipPath),
                contentType: 'application/zip',
                contentLength: zipStats.size,
            });

            await this.queueProviderService.send({
                jobId: request.jobId,
                eventType: EventType.DONE,
                zipKey,
                frameCount,
            });

            this.logger.info('Video processed successfully', { jobId: request.jobId, zipKey });
        } catch (error) {
            this.logger.error('Error processing video', error as Error);

            await this.queueProviderService.send({
                jobId: request.jobId,
                eventType: EventType.ERROR,
                error: (error as Error).message,
            });

            throw error;
        } finally {
            await rm(workDir, { recursive: true, force: true }).catch(() => {});
        }
    }
}
