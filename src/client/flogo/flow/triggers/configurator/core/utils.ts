import {FlowMetadata} from '@flogo/core/interfaces/flow';
import {Tabs} from '../../../shared/tabs/models/tabs.model';
import {TRIGGER_TABS} from './constants';

const defaultTabsInfo: { name: string, labelKey: string }[] = [
  {name: TRIGGER_TABS.MAP_FLOW_INPUT, labelKey: 'TRIGGER-CONFIGURATOR:FLOW-INPUTS'},
  {name: TRIGGER_TABS.MAP_FLOW_OUTPUT, labelKey: 'TRIGGER-CONFIGURATOR:FLOW-OUTPUTS'}
];

export function createTabs(schema, metadata: FlowMetadata) {
  const tabs = Tabs.create(defaultTabsInfo);
  let hasTriggerOutputs = false;
  let hasTriggerReply = false;
  let hasFlowInputs = false;
  let hasFlowOutputs = false;

  if (schema) {
    hasTriggerOutputs = schema.outputs && schema.outputs.length > 0;
    hasTriggerReply = schema.reply && schema.reply.length > 0;
  }

  if (metadata) {
    hasFlowInputs = metadata.input && metadata.input.length > 0;
    hasFlowOutputs = metadata.output && metadata.output.length > 0;
  }
  tabs.get(TRIGGER_TABS.MAP_FLOW_INPUT).inputsLabelKey = 'TRIGGER-MAPPER:LABEL-FLOW-INPUTS';
  tabs.get(TRIGGER_TABS.MAP_FLOW_INPUT).outputsLabelKey = 'TRIGGER-MAPPER:LABEL-TRIGGER-OUTPUT';
  tabs.get(TRIGGER_TABS.MAP_FLOW_INPUT).enabled = hasTriggerOutputs && hasFlowInputs;

  tabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT).inputsLabelKey = 'TRIGGER-MAPPER:LABEL-TRIGGER-REPLY-ATTRIBUTES';
  tabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT).outputsLabelKey = 'TRIGGER-MAPPER:LABEL-FLOW-OUTPUTS';
  tabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT).enabled = hasTriggerReply && hasFlowOutputs;
  return tabs;
}
