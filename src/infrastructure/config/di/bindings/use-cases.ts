import { Container } from 'inversify';

import { ProcessVideoUseCase } from '#/application/use-cases/process-video/process-video';
import { IProcessVideoUseCase } from '#/application/use-cases/process-video/process-video.use-case';
import { TYPES } from '#/infrastructure/config/di/types';

export function bindUseCases(container: Container) {
    container.bind<IProcessVideoUseCase>(TYPES.ProcessVideoUseCase).to(ProcessVideoUseCase).inTransientScope();
}
