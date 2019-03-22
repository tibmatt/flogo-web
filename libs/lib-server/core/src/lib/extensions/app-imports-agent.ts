import { ContributionType } from '@flogo-web/core';

export interface AppImportsAgent {
  getAliasRef(contribType: ContributionType, packageRef: string): string | undefined;
  registerFunctionName(functionName: string): void;
}
