export interface ViewInfo {
  name: string;
  inputsLabelKey: string;
  outputsLabelKey: string;
}

export const VIEWS = {
  INPUTS: <ViewInfo> {
    name: 'inputs',
    inputsLabelKey: 'TRIGGER-MAPPER:LABEL-FLOW-INPUTS',
    outputsLabelKey: 'TRIGGER-MAPPER:LABEL-TRIGGER-OUTPUT',
  },
  REPLY: <ViewInfo> {
    name: 'reply',
    inputsLabelKey: 'TRIGGER-MAPPER:LABEL-TRIGGER-REPLY-ATTRIBUTES',
    outputsLabelKey: 'TRIGGER-MAPPER:LABEL-FLOW-OUTPUTS',
  }
};
