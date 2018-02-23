export interface LegacyFlowWrapper {
  id: string;
  name: string;
  description?: string;
  flow: LegacyFlow;
  metadata: any;
}

// Disabling tslint rule for legacy purposes
/* tslint:disable-next-line:class-name */
export interface flowToJSON_Attribute {
  name: string;
  type: string;
  value: string;
  required?: boolean;
}

// Disabling tslint rule for legacy purposes
/* tslint:disable-next-line:class-name */
export interface flowToJSON_Mapping {
  type: number;
  value: any;
  mapTo: string;
}

// Disabling tslint rule for legacy purposes
/* tslint:disable-next-line:class-name */
export interface flowToJSON_Task {
  id: any;
  type: number;
  activityType: string;
  activityRef?: string;
  flowPath?: string;
  name?: string;
  description?: string;
  attributes: flowToJSON_Attribute[];
  settings?: flowToJSON_Settings;
  inputMappings: flowToJSON_Mapping [];
  ouputMappings: flowToJSON_Mapping[];
}

// Disabling tslint rule for legacy purposes
/* tslint:disable-next-line:class-name */
export interface flowToJSON_Settings {
  iterate?: string;
}

// Disabling tslint rule for legacy purposes
/* tslint:disable-next-line:class-name */
export interface flowToJSON_Link {
  id: number;
  type: number;
  from: any;
  to: any;
  name?: string;
  value?: any;
}

// Disabling tslint rule for legacy purposes
/* tslint:disable-next-line:class-name */
export interface triggerToJSON_TriggerInfo {
  name: string;
  settings: any;
  endpoints: any;
}

// Disabling tslint rule for legacy purposes
/* tslint:disable-next-line:class-name */
export interface triggerToJSON_Trigger {
  triggers: triggerToJSON_TriggerInfo[];
}

// Disabling tslint rule for legacy purposes
/* tslint:disable-next-line:class-name */
export interface LegacyFlow {
  type: number;
  name: string;
  model: string;
  attributes: flowToJSON_Attribute[];
  rootTask: flowToJSON_RootTask;
  errorHandlerTask?: flowToJSON_RootTask;
  explicitReply?: boolean;
}

// Disabling tslint rule for legacy purposes
/* tslint:disable-next-line:class-name */
export interface flowToJSON_RootTask {
  id: any;
  type?: number;
  activityType?: string;
  ref?: string;
  name?: string;
  tasks: flowToJSON_Task[];
  links: flowToJSON_Link[];
}

