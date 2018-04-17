import { FlowMetadata, MetadataAttribute } from '@flogo/core/interfaces';
import { ValueType } from '@flogo/core/constants';
import { AbstractModelConverter } from '../ui-converter.model';
import {FLOGO_PROFILE_TYPE} from '@flogo/core';

export class MicroServiceModelConverter extends AbstractModelConverter {

  getProfileType(): FLOGO_PROFILE_TYPE {
    return FLOGO_PROFILE_TYPE.MICRO_SERVICE;
  }

  getActivitiesSchema(activities) {
    const promises = [];
    activities.forEach(activityRef => {
      promises.push(this.contribService.getContributionDetails(this.getProfileType(), activityRef));
    });
    return Promise.all(promises);
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
        type: input.type || ValueType.String,
      };
      if (!_.isUndefined(input.value)) {
        inputMetadata.value = input.value;
      }
      return inputMetadata;
    });
    metadata.output = flowOutputs.map(input => ({
      name: input.name, type: input.type || ValueType.String,
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
