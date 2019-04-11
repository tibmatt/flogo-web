import { chain, externalSchematic, Rule } from '@angular-devkit/schematics';
import { createServerRule } from './server.rule';
import { createClientRule } from './client.rule';

const PLUGINS_DIR = 'plugins';

export default function(schema: any): Rule {
  const type = schema.type;
  const corePlugin = [];
  if (schema.core) {
    corePlugin.push(
      externalSchematic('@nrwl/schematics', 'lib', {
        name: `${type}-core`,
        directory: PLUGINS_DIR,
        framework: 'none',
        unitTestRunner: 'jest',
        tags: 'client,server,plugins',
        style: 'css',
      })
    );
  }

  return chain([
    ...corePlugin,
    externalSchematic('@nrwl/schematics', 'lib', {
      name: `${type}-client`,
      directory: PLUGINS_DIR,
      framework: 'angular',
      unitTestRunner: 'karma',
      tags: 'client,plugins',
      style: 'less',
      routing: true,
      lazy: true,
    }),
    externalSchematic('@nrwl/schematics', 'lib', {
      name: `${type}-server`,
      directory: PLUGINS_DIR,
      framework: 'none',
      unitTestRunner: 'jest',
      tags: 'server,plugins',
      style: 'css',
    }),
    createServerRule(type, schema),
    createClientRule(type, schema),
  ]);
}
