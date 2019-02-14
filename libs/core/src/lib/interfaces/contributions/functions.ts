import { BaseContributionSchema } from './common';

interface FunctionArgument {
  name: string;
  type: string;
}

export interface SingleFunctionSchema {
  name: string;
  description?: string;
  args?: FunctionArgument[];
}

export interface FunctionsSchema extends BaseContributionSchema {
  functions: SingleFunctionSchema[];
}
