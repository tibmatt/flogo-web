import isEmpty from 'lodash/isEmpty';
import { portAndFormatMappings } from './port-and-format-mappings';
import { createFlowUri } from './create-flow-uri';

const DEFAULT_FLOW_REF = 'github.com/TIBCOSoftware/flogo-contrib/action/flow';

export function formatHandler(handler) {
  const { settings, actionMappings } = handler;
  const formattedMappings = formatMappings(actionMappings);
  return {
    action: {
      ref: DEFAULT_FLOW_REF,
      data: {
        flowURI: createFlowUri(handler.actionId),
      },
      mappings: !isEmpty(formattedMappings) ? formattedMappings : undefined,
    },
    settings: !isEmpty(settings) ? { ...settings } : undefined,
  };
}

function formatMappings(actionMappings = {}) {
  return portAndFormatMappings(actionMappings);
}
