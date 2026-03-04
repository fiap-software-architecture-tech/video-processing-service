import { Container } from 'inversify';

import { bindServices } from '#/infrastructure/config/di/bindings/services';
import { bindUseCases } from '#/infrastructure/config/di/bindings/use-cases';

const container = new Container();

bindServices(container);
bindUseCases(container);

export { container };
