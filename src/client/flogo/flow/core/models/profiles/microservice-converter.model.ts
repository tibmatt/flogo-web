import { FlowMetadata, MetadataAttribute } from '@flogo/core/interfaces';
import { ValueTypes } from '@flogo/core/constants';
import { RESTAPIActivitiesService } from '@flogo/core/services/restapi/activities-api.service';
import { RESTAPITriggersService } from '@flogo/core/services/restapi/triggers-api.service';
import { ErrorService } from '@flogo/core/services/error.service';
import { AbstractModelConverter } from '../ui-converter.model';

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
        type: input.type || ValueTypes.STRING,
      };
      if (!_.isUndefined(input.value)) {
        inputMetadata.value = input.value;
      }
      return inputMetadata;
    });
    metadata.output = flowOutputs.map(input => ({
      name: input.name, type: input.type || ValueTypes.STRING,
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
