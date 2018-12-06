import 'reflect-metadata';
import { Container, injectable, decorate } from 'inversify';
import { ResourceHooks, ResourceRegistrarFn, Newable } from '@flogo-web/server/core';
import { TOKENS } from '../tokens';
import { generateMockHooksImplementation } from './tests/utils';
import { createResourceRegistrar } from './resource-registrar';

const container = new Container();
let registerResourcePlugin: ResourceRegistrarFn;
let resourceHooks: Newable<ResourceHooks>;

beforeEach(() => {
  container.snapshot();
  registerResourcePlugin = createResourceRegistrar(container);
  resourceHooks = generateMockHooksImplementation();
});

afterEach(() => {
  container.restore();
});

test('registers a resource plugin', () => {
  registerResourcePlugin({
    resourceType: 'myCoolPlugin',
    resourceHooks,
  });
  expect(container.getNamed(TOKENS.ResourcePlugin, 'myCoolPlugin')).toBeInstanceOf(
    resourceHooks
  );
});

test('resourceType is required', () => {
  expect(() =>
    registerResourcePlugin({
      resourceType: null,
      resourceHooks,
    })
  ).toThrow(/\[missingParam:resourceType]/);
});

test('resource hooks class is required', () => {
  expect(() =>
    registerResourcePlugin({
      resourceType: 'resourceType',
      resourceHooks: null,
    })
  ).toThrow(/\[missingParam:resourceHooksClass]/);
});

test('resource type should be unique', () => {
  registerResourcePlugin({
    resourceType: 'resourceType',
    resourceHooks,
  });
  expect(() =>
    registerResourcePlugin({
      resourceType: 'resourceType',
      resourceHooks: generateMockHooksImplementation(),
    })
  ).toThrow(/\[pluginTypeAlreadyRegistered]/);
});

test('it should not try to re-decorate as injectable already decorated plugins', () => {
  decorate(injectable(), resourceHooks);
  expect(() =>
    registerResourcePlugin({
      resourceType: 'resourceType',
      resourceHooks: resourceHooks,
    })
  ).not.toThrow();
});
