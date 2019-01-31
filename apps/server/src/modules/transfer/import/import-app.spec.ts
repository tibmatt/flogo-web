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

test('It forwards plugin import validation errors', async () => {
  expect.assertions(1);
  try {
    const app = await importApp(
      cloneDeep(appToImport),
      type => {
        return data => {
          throw new ValidationError('Some resource validation error', {});
        };
      },
      idGenerator(),
      contribs
    );
  } catch (e) {
    expect(e).toBeTruthy();
  }
});
