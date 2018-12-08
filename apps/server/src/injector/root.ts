import 'reflect-metadata';
import { Container } from 'inversify';
import { createResourceRegistrar, bindResourcePluginFactory } from './plugin-injection';
import { ResourceService } from '../modules/resources';

const container = new Container();

container.bind(ResourceService).to(ResourceService);

bindResourcePluginFactory(container);
const registerResourcePlugin = createResourceRegistrar(container);

export { container, registerResourcePlugin };
