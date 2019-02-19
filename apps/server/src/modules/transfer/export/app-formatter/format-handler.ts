import { isEmpty } from 'lodash';
import { createFlowUri } from '@flogo-web/core';

// todo: move into resource plugin
const DEFAULT_FLOW_REF = 'github.com/TIBCOSoftware/flogo-contrib/action/flow';

export function formatHandler(handler) {
  const { settings, actionMappings } = handler;
  return {
    action: {
      ref: DEFAULT_FLOW_REF,
      data: {
        flowURI: createFlowUri(handler.actionId),
      },
      ...actionMappings,
    },
    settings: !isEmpty(settings) ? { ...settings } : undefined,
  };
}
