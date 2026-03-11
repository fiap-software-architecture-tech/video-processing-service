import { SQSEvent } from 'aws-lambda';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockExecute, mockLoggerInfo, mockLoggerError } = vi.hoisted(() => ({
    mockExecute: vi.fn(),
    mockLoggerInfo: vi.fn(),
    mockLoggerError: vi.fn(),
}));

vi.mock('reflect-metadata', () => ({}));
vi.mock('dotenv/config', () => ({}));

vi.mock('#/infrastructure/config/di/container', () => ({
    container: {
        get: vi.fn((symbol: symbol) => {
            const key = symbol.toString();
            if (key === Symbol.for('ProcessVideoUseCase').toString()) {
                return { execute: mockExecute };
            }
            if (key === Symbol.for('Logger').toString()) {
                return { info: mockLoggerInfo, error: mockLoggerError, warn: vi.fn(), debug: vi.fn() };
            }
            return {};
        }),
    },
}));

import { handler } from '#/index';

const createSQSEvent = (...bodies: object[]): SQSEvent => ({
    Records: bodies.map((body, i) => ({
        messageId: `msg-${i}`,
        receiptHandle: `handle-${i}`,
        body: JSON.stringify(body),
        attributes: {} as any,
        messageAttributes: {},
        md5OfBody: '',
        eventSource: 'aws:sqs',
        eventSourceARN: 'arn:aws:sqs:us-east-1:000000000000:test-queue',
        awsRegion: 'us-east-1',
    })),
});

describe('handler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should parse SQS record body and call use case execute', async () => {
        const dto = { jobId: 'job-123', key: 'processing/video.mp4', eventType: 'PROCESSING' };
        mockExecute.mockResolvedValue(undefined);

        await handler(createSQSEvent(dto));

        expect(mockExecute).toHaveBeenCalledWith(dto);
    });

    it('should process multiple SQS records in parallel', async () => {
        const dto1 = { jobId: 'job-1', key: 'processing/a.mp4', eventType: 'PROCESSING' };
        const dto2 = { jobId: 'job-2', key: 'processing/b.mp4', eventType: 'PROCESSING' };
        mockExecute.mockResolvedValue(undefined);

        await handler(createSQSEvent(dto1, dto2));

        expect(mockExecute).toHaveBeenCalledTimes(2);
        expect(mockExecute).toHaveBeenCalledWith(dto1);
        expect(mockExecute).toHaveBeenCalledWith(dto2);
    });

    it('should throw when use case fails', async () => {
        const dto = { jobId: 'job-fail', key: 'processing/bad.mp4', eventType: 'PROCESSING' };
        mockExecute.mockRejectedValue(new Error('Processing failed'));

        await expect(handler(createSQSEvent(dto))).rejects.toThrow('Processing failed');
    });
});
