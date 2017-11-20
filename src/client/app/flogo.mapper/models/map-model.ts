// import { IFlow } from '../app/flows';
import { Observable } from 'rxjs/Observable';
// import { IFunctionArgs, IFunctionContribution, IFunctionReturn } from '../contrib';
// import { STRING_MAP } from '../../types';
// import { IAppModel } from '../index';
// import { IMessaging } from '../messaging';

// tslint:disable-next-line:interface-over-type-literal
type STRING_MAP<T> = {[key: string]: T};



/**
 * Details of a parsed expression string
 */
export interface IParsedExpressionDetails {
  isSyntaxValid: boolean;
  functionReferences: string[];
  memberReferences: string[];
}

/**
 * A Mapped expression and its sub expressions
 */
export interface IMapExpression {
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

  /**
   * Details of a parsed expression string
   */
  parsedExpressionDetails: IParsedExpressionDetails;

  mappingType?: number;

  /**
   * expression string
   * e.g.  String.concat(a.b.c,"abc")
   */
  getExpression(): string;

  /**
   * child expression map for nested expressions
   * map<FunctionToken,IMapExpression>
   * e.g. for-each(x,y)=>{ y.a = x.a, y.b = x.b}
   * e.g. for-each(p,q)=>{ p.a = q.a, p.b = q.b}
   *         child: for-each(p.a,q.a)=>{ for-each(p.a,q.a) => { p.a.x=q.a.x, p.a.y=q.a.y }}
   */
  getMappings(): STRING_MAP<IMapExpression>;
}

/**
 * Root Level mapping for the whole mapper
 * This object is serializable
 */
export interface IMapping {
  /**
   * Individual mapping
   * e.g. a.b.c => String.concat(x.a,y.b)
   * maps are stored in insertion order
   */
  mappings: STRING_MAP<IMapExpression>;

  /**
   * Individual mapping
   * e.g. a.b.c => String.concat(x.a,y.b)
   * maps are stored in insertion order
   */
  // getMappings(): STRING_MAP<IMapExpression>;

}

/**
 * A mapping function is defined by a schema
 * {
 *  arg1: type
 *  arg2: type
 *  return : type
 *  }
 */
// export interface IMappingFunction extends IFunctionContribution {
//   /**
//    * returns the Function Input JSON Schema
//    */
//   getInputSchema(): any;
//
//   /**
//    * returns the function Output JSON Schema
//    */
//   getOutputSchema(): any;
//
//   /**
//    * returns the Function Output JSON Schema
//    */
//   getFullyQualifiedName(): string;
//
//   /**
//    * returns the name of the function
//    */
//   getName(): string;
//
//   /**
//    * returns function args
//    */
//   getArgs(): IFunctionArgs[];
//
//   /**
//    * return function arg by arg name
//    */
//   getArg(name: string): IFunctionArgs;
//
//   /**
//    * return function return type
//    */
//   getReturnType(): IFunctionReturn;
// }

/**
 * Provides function lookup and schemas
 */
export interface IMapFunctionsLookup {
  // getFunctions(): Observable<STRING_MAP<IMappingFunction>>;
  getFunctions(): Observable<STRING_MAP<any>>;

  isValidFunction(fqFunctionPath: string): boolean;

  // getFunction(fqFunctionPath: string): IMappingFunction;
  getFunction(fqFunctionPath: string): any;
}

/**
 * Mapping Error codes
 */
export enum EnumMapperErrorCodes {
  M_INVALID_IDENTIFIER = 4000,
  M_INVALID_FUNCTION,
  M_INVALID_TYPE,
  M_INVALID_SYNTAX
}

/**
 *  Mapping Error Code to Error Messages
 *  load messages from file/resource
 */
export interface IMappingError {
  errorCode: EnumMapperErrorCodes;
  errorMsg: string;

  /**
   * returns errorcode
   */
  getErrorCode(): EnumMapperErrorCodes | number;

  getErrorMessage(): string;

  toString(): string;
}

/**
 * Parse location
 */
export interface IParseLocation {
  getOffset(): number;

  getLine(): number;

  getColumn(): number;

  toString(): string;
}

/**
 * Token location
 */
export interface ITokenLocation {
  getStart(): IParseLocation;

  getEnd(): IParseLocation;
}

/**
 * Parsing Error
 */
export interface IParseError extends IMappingError {
  getLocation(): ITokenLocation;
}


/**
 * Mapping Validation Result
 * A result can contain one or more errors
 */
export interface IMapperResult {
  errors: IMappingError[];

  isValid(): boolean;

  getErrors(): IMappingError[];
}

/**
 * Map Context validator responsible for
 * validating mapping LHS and RHS expressions
 */
export interface IMapContextValidator {
  validate(context: IMapperContext): IMapperResult;
}

/**
 * Provides different contextual schemas
 * e.g. Input Schema
 *      OutputSchema
 */
export interface ISchemaProvider {
  getSchema(contextData: STRING_MAP<any>): any;
}

/**
 * Wraps the token provided by external parser
 */
export interface IParseToken {
  token: any;

  /**
   * get Token type
   */
  getType(): any;

  /**
   * get Token id
   */
  getId(): number;

  /**
   * get Token value
   */
  getValue(): string;

  /**
   * get Token Location
   */
  getLocation(): IParseLocation;
}

/**
 * Provides Tree lookup facility
 */
export interface IParseTree {

  getToken(char_pos: number): IParseToken;

  getTree(): any;
}

/**
 * A parsing action will return a parse tree on successful parse
 * or return a parsing error
 */
export interface IParseResult extends IMapperResult {
  getParseTree(): IParseTree;
}

/**
 * Provides parsing functionality for Javascript/ES6 expressions only
 */
export interface IExpressionParser {
  parse(expression: string): IParseResult;
}

/**
 * A mapper context is the starting point for rendering the mapper and returning its mapping data
 */
export interface IMapperContext {
  /**
   * This id is can be activity id | branch id | sub context id
   * activity id : uuid
   * branch id: uuid
   * sub context id: for-each(a.b,x.y)
   */
  getId(): string;

  /**
   * context data on which the mapper works.
   */
  getContextData(): STRING_MAP<any>;

  /**
   * mapping for this context
   */
  getMapping(): IMapping;

  /**
   * function provider
   */
  getMapFunctionsProvider(): IMapFunctionsLookup;

  /**
   * Validation Provider
   */
  getMapContextValidator(): IMapContextValidator;

  /**
   * provides the JSON schema for this context
   * containing visible schemas in scope from previous
   * activity/task/trigger outputs
   */
  getScopedOutputSchemaProvider(): ISchemaProvider;

  /**
   * provides the JSON schema for the current
   * activity/trigger/branch input
   */
  getContextInputSchemaProvider(): ISchemaProvider;


  /**
   * Mapping Expression Parser
   */
  getExpressionParser(): IExpressionParser;

  /**
   * parent mapping context
   *
   */
  getParentContext(): IMapperContext;

  /**
   * children mapping context
   */
  getChildContexts(): STRING_MAP<IMapperContext>;

  /**
   * context messaging
   */
  // getMessagingService(): IMessaging;

}
