import { AbstractModelConverter } from '../ui-converter.model';
import { ActivitySchema, FLOGO_PROFILE_TYPE } from '@flogo-web/client/core';

export class DeviceModelConverter extends AbstractModelConverter {
  getProfileType(): FLOGO_PROFILE_TYPE {
    return FLOGO_PROFILE_TYPE.DEVICE;
  }

  normalizeActivitySchema(schema: ActivitySchema) {
    // todo: normalize activities in backend?
    schema.inputs = (schema as any).settings;
    schema.outputs = [];
    return schema;
  }

  getFlowInformation(flowJSON) {
    return {
      id: flowJSON.id,
      appId: flowJSON.app.id,
      name: flowJSON.name || flowJSON.id,
      description: flowJSON.description || '',
      app: flowJSON.app,
    };
  }
}
