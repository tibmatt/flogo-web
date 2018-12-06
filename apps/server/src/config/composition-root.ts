import 'reflect-metadata';
import { Container } from 'inversify';
import {
  createResourceRegistrar,
  bindResourcePluginFactory,
} from '../core/plugin-injection';

const container = new Container();

bindResourcePluginFactory(container);
const registerResourcePlugin = createResourceRegistrar(container);

export { container, registerResourcePlugin };
