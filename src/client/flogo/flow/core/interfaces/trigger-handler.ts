export interface TriggerHandler {
  actionId: string;
  triggerId?: string;
  settings: { [name: string]: any };
  outputs: { [name: string]: any };
  actionMappings?: {
    input: object[],
    output: object[],
  };
}
