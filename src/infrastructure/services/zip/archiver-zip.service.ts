import { randomUUID } from 'crypto';
import { createWriteStream } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import archiver from 'archiver';
import { inject, injectable } from 'inversify';

import { ILogger } from '#/domain/services/logger.service';
import { IZipService } from '#/domain/services/zip.service';
import { TYPES } from '#/infrastructure/config/di/types';

@injectable()
export class ArchiverZipService implements IZipService {
    constructor(@inject(TYPES.Logger) private readonly logger: ILogger) {}

    async execute(sourceDir: string): Promise<string> {
        const zipPath = join(tmpdir(), `zip-${randomUUID()}.zip`);

        this.logger.info(`Starting to zip directory: ${sourceDir}`);

        return new Promise((resolve, reject) => {
            const output = createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', () => {
                this.logger.info('ZIP created successfully', { size: archive.pointer() });
                resolve(zipPath);
            });

            archive.on('error', reject);

            archive.pipe(output);
            archive.directory(sourceDir, false);
            archive.finalize();
        });
    }
}
