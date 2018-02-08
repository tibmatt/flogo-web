import { AbstractModelConverter } from '../ui-converter.model';
import { RESTAPIActivitiesService } from '../../../../core/services/restapi/activities-api.service';
import { RESTAPITriggersService } from '../../../../core/services/restapi/triggers-api.service';
import { ErrorService } from '../../../../core/services/error.service';
import { FLOGO_TASK_ATTRIBUTE_TYPE } from '../../../../core/constants';
import { FlowMetadata } from '@flogo/core';
import { MetadataAttribute } from '../../../../core/interfaces/flow/flow-metadata-attribute';

export class MicroServiceModelConverter extends AbstractModelConverter {
  triggerService: RESTAPITriggersService;
  activityService: RESTAPIActivitiesService;

  constructor(triggerService: RESTAPITriggersService,
              activityService: RESTAPIActivitiesService,
              errorService: ErrorService) {
    super(errorService);
    this.triggerService = triggerService;
    this.activityService = activityService;
  }

  getActivitiesPromise(activities) {
    const promises = [];
    activities.forEach(activityRef => {
      promises.push(this.activityService.getActivityDetails(activityRef));
    });
    return Promise.all(promises);
  }

  getTriggerPromise(trigger) {
    if (!trigger.ref) {
      throw this.errorService.makeOperationalError('Trigger: Wrong input json file', 'Cannot get ref for trigger',
        {
          type: 'ValidationError',
          title: 'Wrong input json file',
          detail: 'Cannot get ref for trigger:',
          property: 'trigger',
          value: trigger
        });
    } else {
      return this.triggerService.getTriggerDetails(trigger.ref);
    }
  }

  getFlowInformation(flowJSON) {
    const flowInputs = (flowJSON.metadata && flowJSON.metadata.input) || [];
    const flowOutputs = (flowJSON.metadata && flowJSON.metadata.output) || [];
    const metadata: FlowMetadata = {
      input: [],
      output: []
    };

    metadata.input = flowInputs.map(input => {
      const inputMetadata: MetadataAttribute = {
        name: input.name,
        type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(input, 'type', 'STRING').toUpperCase()],
      };
      if (!_.isUndefined(input.value)) {
        inputMetadata.value = input.value;
      }
      return inputMetadata;
    });
    metadata.output = flowOutputs.map(input => ({
      name: input.name, type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(input, 'type', 'STRING').toUpperCase()],
    }));

    return {
      id: flowJSON.id,
      appId: flowJSON.app.id,
      name: flowJSON.name || flowJSON.id,
      description: flowJSON.description || '',
      app: flowJSON.app,
      metadata
    };
  }
}
