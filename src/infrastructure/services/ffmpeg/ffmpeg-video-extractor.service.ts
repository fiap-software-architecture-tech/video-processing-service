import { execFileSync } from 'child_process';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { mkdir, readdir } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import { inject, injectable } from 'inversify';

import { ILogger } from '#/domain/services/logger.service';
import { IVideoExtractorService } from '#/domain/services/video-extractor.service';
import { TYPES } from '#/infrastructure/config/di/types';

@injectable()
export class FfmpegVideoExtractorService implements IVideoExtractorService {
    constructor(@inject(TYPES.Logger) private readonly logger: ILogger) {}

    /**
     * Encontra o path do FFmpeg dependendo do ambiente
     * - Lambda: /var/task/bin/ffmpeg (incluído no pacote de deploy)
     * - Sistema local: ./bin/ffmpeg ou ffmpeg (no PATH)
     */
    private getFfmpegPath(): string {
        // Lambda path (código do Lambda fica em /var/task)
        const lambdaPath = '/var/task/bin/ffmpeg';
        if (existsSync(lambdaPath)) {
            return lambdaPath;
        }

        // Path local relativo ao projeto
        const localPath = join(process.cwd(), 'bin', 'ffmpeg');
        if (existsSync(localPath)) {
            return localPath;
        }

        // Fallback para ffmpeg no PATH (desenvolvimento local com FFmpeg instalado)
        return 'ffmpeg';
    }

    async execute(videoPath: string): Promise<string> {
        const framesDir = join(tmpdir(), `frames-${randomUUID()}`);
        await mkdir(framesDir, { recursive: true });

        const ffmpegPath = this.getFfmpegPath();

        this.logger.info('Extracting frames from video', { videoPath, framesDir, ffmpegPath });

        const framePattern = join(framesDir, 'frames_%04d.png');

        execFileSync(ffmpegPath, ['-i', videoPath, '-vf', 'fps=1', '-y', framePattern]);

        const files = await readdir(framesDir);
        const frames = files.filter(f => f.endsWith('.png'));

        if (frames.length === 0) {
            throw new Error('No frames were extracted from the video');
        }

        this.logger.info('Frames extracted successfully', { framesCount: frames.length });

        return framesDir;
    }
}
