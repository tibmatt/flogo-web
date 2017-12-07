import { IFlogoApplicationModel } from '@flogo/core/application.model';
import { TriggerGroup } from './trigger-group.interface';
import { FlowGroup } from './flow-group.interface';

export interface App extends IFlogoApplicationModel {
  flowGroups: FlowGroup[];
  triggerGroups: TriggerGroup[];
}
