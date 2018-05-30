import { MapExpression} from './map-model';
import { IMapping } from './mappings';

export class Mapping implements IMapping {

  /**
   * Individual mapping
   * e.g. a.b.c => String.concat(x.a,y.b)
   * maps are stored in insertion order
   */
  mappings: {[key: string]: MapExpression};

  /**
   * Individual mapping
   * e.g. a.b.c => String.concat(x.a,y.b)
   * maps are stored in insertion order
   */
  getMappings(): {[key: string]: MapExpression} {
    return null;
  }

}

