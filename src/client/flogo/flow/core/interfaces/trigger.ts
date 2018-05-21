import { TriggerHandler } from './trigger-handler';

export interface Trigger {
  name: string;
  ref: string;
  description: string;
  settings: any;
  id: string;
  createdAt: string;
  updatedAt: string | null;
  handlers: TriggerHandler[];
  appId: string;
  handler?: any;
}
