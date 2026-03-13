import pino, { Logger } from 'pino';

export function createPinoLogger(): Logger {
    return pino({
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname,reqId',
                singleLine: false,
            },
        },
    });
}
