export const TYPES = {
    // UseCases
    ProcessVideoUseCase: Symbol.for('ProcessVideoUseCase'),

    // Services
    StorageService: Symbol.for('StorageService'),
    QueueProviderService: Symbol.for('QueueProviderService'),
    Logger: Symbol.for('Logger'),
} as const;
