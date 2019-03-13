export interface AppImportsAgent {
  registerRef(string): string | undefined;
  registerFunctionName(string): void;
}
