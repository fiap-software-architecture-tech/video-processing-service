export const TYPES = {
    // UseCases
    ProcessVideoUseCase: Symbol.for('ProcessVideoUseCase'),

    // Services
    StorageService: Symbol.for('StorageService'),
    QueueProviderService: Symbol.for('QueueProviderService'),
    VideoExtractorService: Symbol.for('VideoExtractorService'),
    ZipService: Symbol.for('ZipService'),
    Logger: Symbol.for('Logger'),
} as const;
