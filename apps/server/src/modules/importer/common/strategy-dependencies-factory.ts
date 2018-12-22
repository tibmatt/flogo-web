import { AbstractActionsImporter } from './abstract-actions-importer';
import { AbstractTriggersHandlersImporter } from './abstract-trigger-handlers-importer';
import { Validator } from '../../../common/validator';

export interface StrategyDependencies {
  actionsImporter: AbstractActionsImporter;
  triggersHandlersImporter: AbstractTriggersHandlersImporter;
  validator: Validator;
}

export interface StrategyDependenciesFactory {
  create(): Promise<StrategyDependencies>;
}
