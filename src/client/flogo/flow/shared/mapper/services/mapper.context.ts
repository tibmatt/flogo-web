// import { IFlow } from '../app/flows';
// import { ScopedOutputSchemaProvider } from './map.output.schema.provider';
// import { IAppModel } from '../app/app.model';
import {
  IExpressionParser,
  IMapContextValidator,
  IMapFunctionsLookup,
  IMapperContext,
  IMapping,
  ISchemaProvider
} from '../models/map-model';
// import { STRING_MAP } from '../../../common/index';

// tslint:disable-next-line:interface-over-type-literal
type STRING_MAP<T> = {[key: string]: T};

// import { IMessaging } from '../messaging';

export class MapperContext implements IMapperContext {

  /**
   * This id is can be activity id | branch id | sub context id
   * activity id : uuid
   * branch id: uuid
   * sub context id: for-each(a.b,x.y)
   */
  id: string;

  /**
   * context data on which the mapper works.
   */
  contextData: STRING_MAP<any>;
  /**
   * mapping for this context
   */
  mapping: IMapping;

  /**
   * function provider
   */
  mapFunctionsLookup: IMapFunctionsLookup;

  /**
   * Validation Provider
   */
  mapContextValidator: IMapContextValidator;

  /**
   * provides the JSON schema for this context
   * containing visible schemas in scope from previous
   * activity/task/trigger outputs
   */
  scopedOutputSchemaProvider: ISchemaProvider;

  /**
   * provides the JSON schema for the current
   * activity/trigger/branch input
   */
  contextInputSchemaProvider: ISchemaProvider;


  /**
   * Mapping Expression Parser
   */
  expressionParser: IExpressionParser;

  /**
   * parent mapping context
   *
   */
  parentContext: IMapperContext;

  /**
   * children mapping context
   */
  childContexts: STRING_MAP<IMapperContext>;

  /**
   * messaging service
   */
  // messagingService: IMessaging;

  static create(contextData: STRING_MAP<any>): MapperContext {
    return new MapperContext(contextData);
  }

  constructor(contextData: STRING_MAP<any>) {
    this.contextData = contextData;

    this.mapping = contextData['mapping'];
    this.scopedOutputSchemaProvider = contextData['outputSchema'];
    this.contextInputSchemaProvider = contextData['inputSchema'];

    this.id = contextData['node'].taskID;
    this.mapFunctionsLookup = contextData['functionLookup'];
    this.mapContextValidator = contextData['contextValidator'];
    this.expressionParser = contextData['expressionParser'];
    // this.parentContext = contextData["parentContext"];
    // this.childContexts = contextData[""];
    // this.messagingService = contextData['messaging'];
  }

  /**
   * This id is can be activity id | branch id | sub context id
   * activity id : uuid
   * branch id: uuid
   * sub context id: for-each(a.b,x.y)
   */
  getId(): string {
    return this.id;
  }

  /**
   * context data on which the mapper works.
   */
  getContextData(): any {
    return this.contextData;
  }

  /**
   * mapping for this context
   */
  getMapping(): IMapping {
    return this.mapping;
  }

  /**
   * function provider
   */
  getMapFunctionsProvider(): IMapFunctionsLookup {
    return this.mapFunctionsLookup;
  }

  /**
   * Validation Provider
   */
  getMapContextValidator(): IMapContextValidator {
    return this.mapContextValidator;
  }

  /**
   * provides the JSON schema for this context
   * containing visible schemas in scope from previous
   * activity/task/trigger outputs
   */
  getScopedOutputSchemaProvider(): ISchemaProvider {
    return this.scopedOutputSchemaProvider;
  }

  /**
   * provides the JSON schema for the current
   * activity/trigger/branch input
   */
  getContextInputSchemaProvider(): ISchemaProvider {
    return this.contextInputSchemaProvider;
  }


  /**
   * Mapping Expression Parser
   */
  getExpressionParser(): IExpressionParser {
    return this.expressionParser;
  }

  /**
   * parent mapping context
   *
   */
  getParentContext(): IMapperContext {
    return this.parentContext;
  }

  /**
   * children mapping context
   */
  getChildContexts(): STRING_MAP<IMapperContext> {
    return this.childContexts;
  }

  /**
   * Messaging Service
   */
  getMessagingService() {
    // return this.messagingService;
    return null;
  }

}
