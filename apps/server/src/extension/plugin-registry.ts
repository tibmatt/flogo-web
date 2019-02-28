import { injectable, inject } from 'inversify';
import { Logger } from 'winston';

import { ResourcePlugin, ResourceRegistrar } from '@flogo-web/server/core';

import { TOKENS } from '../core';
import { HookApplicator } from './hooks';
import { ResourcePorting } from './porting';

@injectable()
export class PluginRegistry implements ResourceRegistrar {
  readonly types = new Map<string, { ref: string }>();
  readonly porting = new ResourcePorting();
  readonly resourceHooks: HookApplicator;

  constructor(@inject(TOKENS.Logger) private logger: Logger) {
    this.resourceHooks = new HookApplicator(logger);
  }

  isKnownType(type: string) {
    return this.types.has(type);
  }

  use(pluginDefinition: ResourcePlugin) {
    const { type, ref } = pluginDefinition;
    this.types.set(type, { ref });
    this.porting.load(type, {
      import: pluginDefinition.import,
      export: pluginDefinition.export,
    });
    if (pluginDefinition.hooks && pluginDefinition.hooks.resource) {
      this.resourceHooks.load(pluginDefinition.hooks.resource);
    }
    this.logger.info(`Registered resource plugin '${type}' (${ref})`);
  }
}
