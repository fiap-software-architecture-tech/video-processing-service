import 'reflect-metadata';
import 'dotenv/config';

import { SQSEvent } from 'aws-lambda';

import { VideoProcessDTO } from '#/application/use-cases/process-video/dto/video-process.dto';
import { IProcessVideoUseCase } from '#/application/use-cases/process-video/process-video.use-case';
import { ILogger } from '#/domain/services/logger.service';
import { container } from '#/infrastructure/config/di/container';
import { TYPES } from '#/infrastructure/config/di/types';

const useCase = container.get<IProcessVideoUseCase>(TYPES.ProcessVideoUseCase);
const logger = container.get<ILogger>(TYPES.Logger);

export async function handler(event: SQSEvent) {
    logger.info('Received SQS event', { event });

    await Promise.all(
        event.Records.map(async record => {
            const body = JSON.parse(record.body);

            try {
                // A mensagem vem diretamente do video-core sem wrapper "data"
                const dto: VideoProcessDTO = body;
                logger.info('Processing video', { jobId: dto.jobId });
                await useCase.execute(dto);
                logger.info('Video processed successfully', { jobId: dto.jobId });
            } catch (error) {
                logger.error('Error processing video', error as Error);
                throw error;
            }
        }),
    );
}
