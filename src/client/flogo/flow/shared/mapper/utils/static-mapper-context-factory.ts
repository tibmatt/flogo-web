import { MapExpression, MapperContext } from '../models';
import { getFunctions } from './functions';

export class StaticMapperContextFactory {
  static create(inputSchemas: any, outputSchemas: any, mappings: {[lhs: string]: MapExpression}): MapperContext {
    return {
      mappings,
      outputSchemas,
      inputSchemas,
      functions: getFunctions(),
    };
  }
}
