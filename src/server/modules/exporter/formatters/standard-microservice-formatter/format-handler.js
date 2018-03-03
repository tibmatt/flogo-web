import isEmpty from 'lodash/isEmpty';
import { portMappings } from './format-mappings';

const DEFAULT_FLOW_REF = 'github.com/TIBCOSoftware/flogo-contrib/action/flow';

export function formatHandler(handler) {
  const { settings, actionMappings } = handler;
  const formattedMappings = formatMappings(actionMappings);
  return {
    action: {
      ref: DEFAULT_FLOW_REF,
      data: {
        flowURI: `res://flow:${handler.actionId}`,
      },
      mappings: !isEmpty(formattedMappings) ? formattedMappings : undefined,
    },
    settings: !isEmpty(settings) ? { ...settings } : undefined,
  };
}

function formatMappings(actionMappings = {}) {
  const portedMappings = portMappings(actionMappings);
  const formattedMappings = {};
  if (!isEmpty(portedMappings.input)) {
    formattedMappings.input = portedMappings.input;
  }
  if (!isEmpty(portedMappings.output)) {
    formattedMappings.output = portedMappings.output;
  }
  return formattedMappings;
}
