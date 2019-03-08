import { ContributionSchema } from '@flogo-web/core';
import { ParsedImport } from '../../common/parsed-import';
import { RefAgent } from './ref-agent';
import { FunctionRefFinder } from './function-ref-finder';

export function createRefAgent(
  contributions: ContributionSchema[],
  predeterminedImports?: ParsedImport[]
): RefAgent {
  return new RefAgent(new FunctionRefFinder(contributions), predeterminedImports);
}
