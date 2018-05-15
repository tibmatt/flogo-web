export interface IFlogoTrigger {
  name: string;
  ref: string;
  description: string;
  settings: any;
  id: string;
  createdAt: string;
  updatedAt: string | null;
  handlers: any[];
  appId: string;
  handler?: any;
}
