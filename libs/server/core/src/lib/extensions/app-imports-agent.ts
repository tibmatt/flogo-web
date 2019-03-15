export interface AppImportsAgent {
  registerRef(ref: string): string | undefined;
  registerFunctionName(functionName: string): void;
}
