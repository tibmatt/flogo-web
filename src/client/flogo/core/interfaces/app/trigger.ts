export interface Trigger {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  settings: any;
  handlers: any[];
}
