import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/of';

import { IMapExpression, IMapFunctionsLookup, IMapping, ISchemaProvider } from '../models';

export class StaticMapperContextFactory {
  static create(inputSchema: any, outputSchema: any, mappings: {[lhs: string]: IMapExpression}) {
    return {
      getMapFunctionsProvider(): IMapFunctionsLookup {
        return {
          getFunctions() {
            return Observable.of([]);
          },
          isValidFunction() {
            // throw new Error('not implemented');
            return true;
          },
          getFunction() {
            throw new Error('not implemented');
          }
        };
      },
      getScopedOutputSchemaProvider(): ISchemaProvider {
        return {
          getSchema: () => outputSchema
        };
      },
      getContextInputSchemaProvider(): ISchemaProvider {
        return {
          getSchema: () => inputSchema
        };
      },
      getContextData() {
        return {};
      },
      getMapping(): IMapping {
        return {
          mappings
        };
      }
    };
  }
}
