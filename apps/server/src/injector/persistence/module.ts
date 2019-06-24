import { ContainerModule, interfaces } from 'inversify';
import { indexer, collections } from '../../common/db';
import { TOKENS } from '../../core';

export const PersistenceModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(TOKENS.AppsDb).toDynamicValue(() => collections.apps);
  bind(TOKENS.ResourceIndexerDb).toConstantValue(indexer);
});
