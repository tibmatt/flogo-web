import { IMapExpression, IParsedExpressionDetails } from '../models/map-model';

// tslint:disable-next-line:interface-over-type-literal
type STRING_MAP<T> = {[key: string]: T};

export class MapExpression implements IMapExpression {
  /**
   * expression string
   * e.g.  String.concat(a.b.c,"abc")
   */
  expression: string;

  /**
   * child expression map for nested expressions
   * map<FunctionToken,IMapExpression>
   * e.g. for-each(x,y)=>{ y.a = x.a, y.b = x.b}
   * e.g. for-each(p,q)=>{ p.a = q.a, p.b = q.b}
   *         child: for-each(p.a,q.a)=>{ for-each(p.a,q.a) => { p.a.x=q.a.x, p.a.y=q.a.y }}
   */
  mappings: STRING_MAP<IMapExpression>;

  parsedExpressionDetails: IParsedExpressionDetails;

  /**
   * expression string
   * e.g.  String.concat(a.b.c,"abc")
   */
  getExpression(): String {
    return this.expression;
  }

  /**
   * child expression map for nested expressions
   * map<FunctionToken,IMapExpression>
   * e.g. for-each(x,y)=>{ y.a = x.a, y.b = x.b}
   * e.g. for-each(p,q)=>{ p.a = q.a, p.b = q.b}
   *         child: for-each(p.a,q.a)=>{ for-each(p.a,q.a) => { p.a.x=q.a.x, p.a.y=q.a.y }}
   */
  getMappings(): STRING_MAP<IMapExpression> {
    return this.mappings;
  }
}
