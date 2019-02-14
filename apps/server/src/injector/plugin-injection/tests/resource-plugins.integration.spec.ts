import 'reflect-metadata';
import { Container, injectable, inject } from 'inversify';
import { TOKENS, PluginResolverFn } from '../../../core';
import { bindResourcePluginFactory } from '../resource-plugin-factory';
import { createResourceRegistrar } from '../resource-registrar';
import { generateMockHooksImplementation } from './utils';
@injectable()
class ResourcePluginConsumer {
  constructor(
    @inject(TOKENS.ResourcePluginFactory)
    private resourcePluginFactory: PluginResolverFn
  ) {}
  resolvePlugin(pluginType: string) {
    return this.resourcePluginFactory(pluginType);
  }
}

let pluginImplementation1;
let pluginImplementation2;
let pluginConsumer: ResourcePluginConsumer;
beforeAll(() => {
  const context = createContext();
  pluginConsumer = context.pluginConsumer;

  pluginImplementation1 = generateMockHooksImplementation();
  context.registerPlugin({
    resourceType: 'type1',
    resourceHooks: pluginImplementation1,
  });

  pluginImplementation2 = generateMockHooksImplementation();
  context.registerPlugin({
    resourceType: 'type2',
    resourceHooks: pluginImplementation2,
  });
});

describe('it resolves the correct resource plugin instance', () => {
  test('for a given type', () => {
    expect(pluginConsumer.resolvePlugin('type1')).toBeInstanceOf(pluginImplementation1);
  });
  test('for a different given type', () => {
    expect(pluginConsumer.resolvePlugin('type2')).toBeInstanceOf(pluginImplementation2);
  });
});

test('it does not error the correct resource plugin instance', () => {
  expect(pluginConsumer.resolvePlugin('unregisteredType')).toBeFalsy();
});

function createContext() {
  const container = new Container();
  bindResourcePluginFactory(container);
  const registerPlugin = createResourceRegistrar(container);
  return {
    pluginConsumer: container.resolve<ResourcePluginConsumer>(ResourcePluginConsumer),
    registerPlugin,
  };
}
