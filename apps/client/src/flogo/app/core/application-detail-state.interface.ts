export interface ApplicationDetailState {
  name: {
    pendingSave: boolean;
    hasErrors: boolean;
    errors: { [key: string]: boolean };
  };
  description: {
    pendingSave: boolean;
    hasErrors: boolean;
    errors: { [key: string]: boolean };
  };
}
