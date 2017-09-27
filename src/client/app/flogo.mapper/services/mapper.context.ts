// import { IFlow } from "../../../common/models/app/flows";
// import { ScopedOutputSchemaProvider } from "./map.output.schema.provider";
// import { IAppModel } from "../../../common/models/app/app.model";
// import {
//   IMapperContext,
//   IMapping,
//   IMapFunctionsLookup,
//   IMapContextValidator,
//   ISchemaProvider,
//   IExpressionParser
// } from "../../../common/models/mapper/map-model";
// import { STRING_MAP } from "../../../common/index";
// import {IMessaging} from "../../../common/models/messaging";
//
// export class MapperContext implements IMapperContext {
//
//   /**
//    * This id is can be activity id | branch id | sub context id
//    * activity id : uuid
//    * branch id: uuid
//    * sub context id: for-each(a.b,x.y)
//    */
//   id: string;
//
//   /**
//    * context data on which the mapper works.
//    */
//   contextData: STRING_MAP<IAppModel | IFlow | any>;
//   /**
//    * mapping for this context
//    */
//   mapping: IMapping;
//
//   /**
//    * function provider
//    */
//   mapFunctionsLookup: IMapFunctionsLookup;
//
//   /**
//    * Validation Provider
//    */
//   mapContextValidator: IMapContextValidator;
//
//   /**
//    * provides the JSON schema for this context
//    * containing visible schemas in scope from previous
//    * activity/task/trigger outputs
//    */
//   scopedOutputSchemaProvider: ISchemaProvider;
//
//   /**
//    * provides the JSON schema for the current
//    * activity/trigger/branch input
//    */
//   contextInputSchemaProvider: ISchemaProvider;
//
//
//   /**
//    * Mapping Expression Parser
//    */
//   expressionParser: IExpressionParser;
//
//   /**
//    * parent mapping context
//    *
//    */
//   parentContext: IMapperContext;
//
//   /**
//    * children mapping context
//    */
//   childContexts: STRING_MAP<IMapperContext>;
//
//   /**
//    * messaging service
//    */
//   messagingService: IMessaging;
//
//   constructor(contextData: STRING_MAP<IAppModel | IFlow | any>) {
//     this.id = contextData["node"].taskID;
//     this.contextData = contextData;
//     this.mapFunctionsLookup = contextData["functionLookup"];
//     this.mapContextValidator = contextData["contextValidator"];
//     this.scopedOutputSchemaProvider = contextData["outputSchema"];
//     this.contextInputSchemaProvider = contextData["inputSchema"];
//     this.expressionParser = contextData["expressionParser"];
//     // this.parentContext = contextData["parentContext"];
//     // this.childContexts = contextData[""];
//     this.messagingService = contextData["messaging"];
//     this.mapping = contextData["mapping"];
//   }
//   /**
//    * This id is can be activity id | branch id | sub context id
//    * activity id : uuid
//    * branch id: uuid
//    * sub context id: for-each(a.b,x.y)
//    */
//   getId(): string { return this.id; }
//   /**
//    * context data on which the mapper works.
//    */
//   getContextData(): any | IAppModel { return this.contextData; }
//   /**
//    * mapping for this context
//    */
//   getMapping(): IMapping { return this.mapping; }
//
//   /**
//    * function provider
//    */
//   getMapFunctionsProvider(): IMapFunctionsLookup { return this.mapFunctionsLookup; }
//
//   /**
//    * Validation Provider
//    */
//   getMapContextValidator(): IMapContextValidator { return this.mapContextValidator; }
//
//   /**
//    * provides the JSON schema for this context
//    * containing visible schemas in scope from previous
//    * activity/task/trigger outputs
//    */
//   getScopedOutputSchemaProvider(): ISchemaProvider {
//     return this.scopedOutputSchemaProvider;
//   }
//
//   /**
//    * provides the JSON schema for the current
//    * activity/trigger/branch input
//    */
//   getContextInputSchemaProvider(): ISchemaProvider { return this.contextInputSchemaProvider; }
//
//
//   /**
//    * Mapping Expression Parser
//    */
//   getExpressionParser(): IExpressionParser { return this.expressionParser; }
//
//   /**
//    * parent mapping context
//    *
//    */
//   getParentContext(): IMapperContext { return this.parentContext; }
//
//   /**
//    * children mapping context
//    */
//   getChildContexts(): STRING_MAP<IMapperContext> { return this.childContexts; }
//
//   /**
//    * Messaging Service
//    */
//   getMessagingService(): IMessaging { return this.messagingService; }
//
// }
