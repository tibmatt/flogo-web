import { cloneDeep } from 'lodash';
import { ValidationError } from '@flogo-web/server/core';
import { importApp } from './import-app';

import { importedApp } from '../tests/samples/imported-app';
const appToImport = require('../tests/samples/standard-app.json');
const activities = require('../tests/samples/activities.json');

const triggers = require('../tests/samples/triggers.json');

function idGenerator() {
  let nextId = 0;
  return () => {
    nextId++;
    return nextId + '';
  };
}

function identityPlugin() {
  return type => data => data;
}

let contribs: Map<string, any>;

beforeAll(() => {
  contribs = new Map([...activities, ...triggers].map(c => [c.ref, c] as [string, any]));
});

test('import app', async () => {
  const app = await importApp(
    cloneDeep(appToImport),
    identityPlugin(),
    idGenerator(),
    contribs
  );
  expect(app).toMatchObject(importedApp);
});

test('It collects and forwards plugin import validation errors', async () => {
  expect.assertions(2);
  const multiResourceApp = cloneDeep(appToImport);
  const [resource] = multiResourceApp.resources;
  multiResourceApp.resources = [
    resource,
    { ...cloneDeep(resource), id: 'flow:resource2' },
  ];
  try {
    let errorCount = 0;
    const app = await importApp(
      multiResourceApp,
      type => {
        return data => {
          throw new ValidationError('Some resource validation error', [
            {
              keyword: 'plugin-error',
              dataPath: '.foo',
              params: {
                errorCount: ++errorCount,
              },
            },
          ]);
        };
      },
      idGenerator(),
      contribs
    );
  } catch (e) {
    const errors = e.details.errors;
    expect(errors).toHaveLength(2);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dataPath: '.resources[0].foo',
          keyword: 'plugin-error',
          params: {
            errorCount: 1,
          },
        }),
        expect.objectContaining({
          dataPath: '.resources[1].foo',
          keyword: 'plugin-error',
          params: {
            errorCount: 2,
          },
        }),
      ])
    );
  }
});

test('It throws a validation error if resource is not supported', async () => {
  expect.assertions(1);
  try {
    const app = await importApp(
      cloneDeep(appToImport),
      type => null,
      idGenerator(),
      contribs
    );
  } catch (e) {
    expect(e.details.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dataPath: '.resources[0].type',
          keyword: 'supported-resource-type',
          params: {
            type: 'flow',
          },
        }),
      ])
    );
  }
});
