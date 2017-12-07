import { IMapFunctionsLookup, ISchemaProvider, IExpressionParser, STRING_MAP } from '@flogo/flow/shared/mapper/models/map-model';
import { IMapping } from './imapping';
import { IMapContextValidator } from '@flogo/flow/shared/mapper/models/imap-context-validator';

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
