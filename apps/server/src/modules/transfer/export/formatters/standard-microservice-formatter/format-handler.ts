import isEmpty from 'lodash/isEmpty';
import { createFlowUri } from './create-flow-uri';

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
