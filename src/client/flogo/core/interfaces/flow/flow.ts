export interface Flow {
  id: string;
  name: string;
  description?: string;
  appId: string;
  app: FlowApp;
}

interface FlowApp {
  id: string;
  name: string;
  type: string;
  version?: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
}
