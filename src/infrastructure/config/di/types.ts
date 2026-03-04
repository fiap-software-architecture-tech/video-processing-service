export const TYPES = {
    // UseCases
    ProcessVideoUseCase: Symbol.for('ProcessVideoUseCase'),

    // Services
    StorageService: Symbol.for('StorageService'),
    QueueProviderService: Symbol.for('QueueProviderService'),
    VideoExtractor: Symbol.for('VideoExtractor'),
    ZipService: Symbol.for('ZipService'),
    Logger: Symbol.for('Logger'),
} as const;
