import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/distinctUntilKeyChanged';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/withLatestFrom';

import { resolveExpressionType } from '@flogo/packages/mapping-parser';

import { TreeNodeFactoryService } from './tree-node-factory.service';
import { TreeService } from './tree.service';
// import { ExpressionProcessorService } from './expression-processor.service';
import {
  IMapExpression,
  IMapFunctionsLookup,
  ISchemaProvider
} from '../models/map-model';
import { MapperTreeNode } from '../models/mapper-treenode.model';

import { ArrayMappingHelper, ArrayMappingInfo } from '../models/array-mapping';
import { IParsedExpressionDetails, IMapperContext } from '../models';
import { TYPE_ATTR_ASSIGNMENT } from '../constants';

export interface TreeState {
  filterTerm: string | null;
  nodes: MapperTreeNode[];
}

export interface CurrentSelection {
  node?: MapperTreeNode;
  editingExpression?: EditingExpression;
  errors?: any[];
  symbolTable?: { [key: string]: any };
  mappings?: Mappings;
  mappingKey?: string;
  mapRelativeTo?: string;
}

export interface Mappings {
  [path: string]: IMapExpression;
}

export interface MapperState {
  context: IMapperContext;
  providers?: {
    outputsProvider: ISchemaProvider;
    functionsProvider: IMapFunctionsLookup;
  };
  hasMappings: boolean;
  mappings: Mappings;
  currentSelection?: CurrentSelection;
  inputs: TreeState;
  outputs: TreeState;
  functions: TreeState;
}

export interface OutputContext {
  tree: MapperTreeNode[];
  mappings: Mappings;
  mappingKey: string;
  /***
   * Relative references ($.references) are relative to this path
   */
  mapRelativeTo: string;
  symbolTable: any;
}

interface  EditingExpression {
  expression: string;
  mappingType?: number;
}

@Injectable()
export class MapperService {

  state: ReplaySubject<MapperState> = new ReplaySubject(1);

  private contextSrc: Subject<IMapperContext> = new Subject();
  private updatesSrc: Subject<any> = new Subject<any>();

  //// actions
  private filterInputsSrc: Subject<string> = new Subject<string>();
  private filterOutputsSrc: Subject<string> = new Subject<string>();
  private filterFunctionsSrc: Subject<string> = new Subject<string>();
  private selectInputSrc: Subject<MapperTreeNode> = new Subject<MapperTreeNode>();
  private expressionChangeSrc: Subject<EditingExpression> = new Subject<EditingExpression>();

  constructor(private nodeFactory: TreeNodeFactoryService,
              private treeService: TreeService,
              // private parserService: ExpressionProcessorService
  ) {

    this.updatesSrc
      .scan((accumulator: MapperState, operation: Function) => {
        return operation(accumulator);
      }, {})
      .subscribe(this.state);

    this.filterInputsSrc
      .map(filterTerm => (state: MapperState) => {
        const currentNode = state.currentSelection ? state.currentSelection.node : null;
        return Object.assign({}, state, { inputs: this.applyTreeFilter(filterTerm, state.inputs, currentNode) });
      })
      .subscribe(this.updatesSrc);

    this.filterOutputsSrc
      .map(filterTerm => (state: MapperState) => {
        return Object.assign({}, state, { outputs: this.applyTreeFilter(filterTerm, state.outputs) });
      })
      .subscribe(this.updatesSrc);

    this.filterFunctionsSrc
      .map(filterTerm => (state: MapperState) => {
        return Object.assign({}, state, { functions: this.applyTreeFilter(filterTerm, state.functions) });
      })
      .subscribe(this.updatesSrc);

    this.setupContextChange();
    this.setupExpressionChange();
    this.setupSelectInput();

  }

  setContext(context: IMapperContext) {
    this.contextSrc.next(context);
  }

  selectInput(node: MapperTreeNode) {
    this.selectInputSrc.next(node);
  }

  filterInputs(filterTerm: string) {
    this.filterInputsSrc.next(filterTerm);
  }

  filterOutputs(filterTerm: string) {
    this.filterOutputsSrc.next(filterTerm);
  }

  filterFunctions(filterTerm: string) {
    this.filterFunctionsSrc.next(filterTerm);
  }

  expressionChange(value: EditingExpression) {
    this.expressionChangeSrc.next(value);
  }

  private setupSelectInput() {
    this.selectInputSrc
      .distinctUntilChanged()
      .withLatestFrom(this.state, (node: MapperTreeNode, state: MapperState) => ({ node, state }))
      .switchMap(({ node, state }: { node: MapperTreeNode, state: MapperState }) => {
        if (node) {
          return Observable.zip(
            [node],
            Observable.of(state.providers.outputsProvider.getSchema(state.context.getContextData()))
              .map(outputSchemas => this.makeOutputContext(node, outputSchemas, state.mappings)),
            state.providers.functionsProvider.getFunctions()
              .map(functions => ({
                treeNodes: this.nodeFactory.fromFunctions(functions),
                symbolTable: <any> this.nodeFactory.fromFunctionsToSymbolTable(functions),
              })),
          );
        } else {
          return Observable.of([node, <any>{}, <any>[]]);
        }
      })
      .map(([node, outputContext, functions]: [MapperTreeNode, OutputContext, { treeNodes: MapperTreeNode[], symbolTable: any }]) => {
        let currentSelection: CurrentSelection = null;
        if (node && node.data) {
          if (!outputContext) {
            return (state: MapperState) => Object.assign({}, state, {
              currentSelection: { mappingKey: null },
              inputs: { nodes: this.treeService.selectNode(state.inputs.nodes, node ? node.path : null) },
              functions: { filterTerm: '', nodes: [] },
              outputs: { filterTerm: '', nodes: [] },
            });
          }
          const mapping = outputContext.mappings[outputContext.mappingKey];
          const symbolTable = Object.assign({}, outputContext.symbolTable, functions.symbolTable);
          currentSelection = {
            node,
            symbolTable,
            editingExpression: mapping ?
              { expression: mapping.expression, mappingType: mapping.mappingType }
              : { expression: '', mappingType: TYPE_ATTR_ASSIGNMENT },
            mappings: outputContext.mappings,
            mappingKey: outputContext.mappingKey,
            mapRelativeTo: outputContext.mapRelativeTo,
          };

          let expectedResultType = { type: node.dataType, array: false };
          if (node.dataType === 'array') {
            expectedResultType = { array: true, type: node.memberType || 'object' };
          }
          expectedResultType.type = expectedResultType.type === 'date' ? 'string' : expectedResultType.type;
          // const parseResult = this.parserService.processExpression(currentSelection.expression,
          //   expectedResultType, currentSelection.symbolTable, outputContext.mapRelativeTo);
          const parseResult = <any>{};
          currentSelection.errors = parseResult.errors && parseResult.errors.length > 0 ? parseResult.errors : null;
        }

        return (state: MapperState) => Object.assign({}, state, {
          currentSelection,
          inputs: { nodes: this.treeService.selectNode(state.inputs.nodes, node ? node.path : null) },
          functions: { filterTerm: '', nodes: functions.treeNodes },
          outputs: { filterTerm: '', nodes: outputContext.tree },
        });
      })
      .subscribe(this.updatesSrc);
  }

  private setupContextChange() {
    this.contextSrc
      .map((context: IMapperContext) => {
        return (state: MapperState) => {
          const newState = this.getInitialState();
          newState.context = context;

          newState.providers = {
            functionsProvider: context.getMapFunctionsProvider(),
            outputsProvider: context.getScopedOutputSchemaProvider(),
          };

          const inputSchemaProvider = context.getContextInputSchemaProvider();
          // let mappingsProvider = null;
          let iMapping;
          if (context.getMapping) {
            // mappingsProvider = context.getMapping();
            iMapping = context.getMapping();
          }
          // mappingsProvider = mappingsProvider || { getMappings: () => ({}) };
          // let mappings = mappingsProvider.getMappings();
          iMapping = iMapping || {};
          newState.mappings = iMapping.mappings || {};
          newState.hasMappings = this.hasMappings(newState.mappings);
          const flattenedMappings = this.nodeFactory.flatMappings(newState.mappings);

          const inputSchemas = inputSchemaProvider.getSchema(<any>context.getContextData());
          newState.inputs.nodes = this.nodeFactory.fromJsonSchema(inputSchemas,
            (treeNode: MapperTreeNode, level, path, parents: MapperTreeNode[]) => {
              treeNode.data.level = level;
              const expression = flattenedMappings[path];
              treeNode.data.expression = expression || null;
              return treeNode;
          });
          // todo: improve for performance
          newState.inputs.nodes.forEach(node => this.treeService.updateTreeMappingStatus(node));
          return newState;
        };
      })
      .subscribe(this.updatesSrc);
  }

  private setupExpressionChange() {
    const isSameEditingExpression = (prev: EditingExpression, next: EditingExpression) => {
      if (!prev && next || !next && prev) {
        return false;
      }
      return prev.expression === next.expression && prev.mappingType === next.mappingType;
    };

    this.expressionChangeSrc
      .withLatestFrom(
        this.state.map((state: MapperState) => state.currentSelection && state.currentSelection.node).distinctUntilChanged(),
        (editingExpression: EditingExpression, currentNode: MapperTreeNode) => ({ editingExpression, currentNode })
      )
      .distinctUntilChanged((prev, next) =>
        isSameEditingExpression(prev.editingExpression, next.editingExpression) && prev.currentNode === next.currentNode)
      .map(({ editingExpression }) => editingExpression)
      .map(editingExpression => (state: MapperState) => {
        const currentSelection = state.currentSelection;
        const node = currentSelection.node;
        node.data.expression = editingExpression.expression;
        currentSelection.editingExpression = editingExpression;

        let expectedResultType = { type: node.dataType, array: false };
        if (node.dataType === 'array') {
          expectedResultType = { array: true, type: node.memberType || 'object' };
        }
        expectedResultType.type = expectedResultType.type === 'date' ? 'string' : expectedResultType.type;

        // const parseResult = this.parserService.processExpression(state.currentSelection.expression,
        const parseResult = <any>{};
        //   expectedResultType,
        //   state.currentSelection.symbolTable, state.currentSelection.mapRelativeTo);
        // state.currentSelection.errors = parseResult.errors && parseResult.errors.length > 0 ? parseResult.errors : null;
        const expression = editingExpression.expression;
        node.isInvalid = expression && expression.trim() && !resolveExpressionType(expression);

        this.updateMapping(currentSelection.mappings, currentSelection.mappingKey, editingExpression, parseResult.structureDetails);

        state.hasMappings = this.hasMappings(state.mappings);

        // this.treeService.updateMappingStatus(node);
        this.treeService.propagateMappingStatusToParents(node);

        return Object.assign({}, state);
      })
      .subscribe(this.updatesSrc);
  }

  private updateMapping(
    mappings: Mappings,
    path: string,
    editingExpression: EditingExpression,
    parsedExpressionDetails?: IParsedExpressionDetails
  ) {
    const existingMapping = mappings[path];
    const isEmptyExpression = !editingExpression || !editingExpression.expression || !editingExpression.expression.trim();
    if (existingMapping) {
      if (!isEmptyExpression) {
        existingMapping.expression = editingExpression.expression;
        existingMapping.mappingType = editingExpression.mappingType;
        existingMapping.parsedExpressionDetails = parsedExpressionDetails;
      } else {
        delete mappings[path];
      }
    } else if (!isEmptyExpression) {
      // todo: check types
      mappings[path] = <any>{
        expression: editingExpression.expression,
        mappingType: editingExpression.mappingType,
        mappings: <Map<any, any>>{},
        parsedExpressionDetails,
      };
    }
    return mappings;
  }

  private hasMappings(mappings: Mappings) {
    return mappings && Object.keys(mappings).some(path => {
      const mapping = mappings[path];
      return !!(mapping.expression && mapping.expression.trim());
    });
  }

  private applyTreeFilter(filterTerm: string, treeState: TreeState, currentSelection?: MapperTreeNode) {
    const currentSelectionPath = currentSelection && currentSelection.data ? currentSelection.data.path : null;
    const nodes = this.treeService.applyFilter(treeState.nodes, filterTerm, currentSelectionPath);
    return Object.assign({}, treeState, { filterTerm, nodes });
  }

  private makeOutputContext(selectedNode: MapperTreeNode, outputSchemas: any, allMappings: Mappings): OutputContext {
    const arrayParentsOfSelectedNode = this.treeService.extractArrayParents(selectedNode);
    let mappings = allMappings;
    // const mappedOutputArrays = this.extractLinkedOutputArrays(arrayParents, allMappings);

    const isMappedParent = (p: ArrayMappingInfo) => p.isForEach; // && p.params.length > 0;

    let mappingKey = selectedNode.path;
    const selectedNodeHasArrayParents = arrayParentsOfSelectedNode && arrayParentsOfSelectedNode.length > 0;
    let hasMappedArrayParents = false;
    let mappedOutputArrays = this.extractLinkedOutputArrayPaths(arrayParentsOfSelectedNode, allMappings);
    let lastMappedParent = null;
    if (selectedNodeHasArrayParents) {
      const closestArrayParent = arrayParentsOfSelectedNode[arrayParentsOfSelectedNode.length - 1];
      mappedOutputArrays = this.extractLinkedOutputArrayPaths(arrayParentsOfSelectedNode, allMappings);
      hasMappedArrayParents = mappedOutputArrays && mappedOutputArrays.length > 0 && mappedOutputArrays.some(p => isMappedParent(p));
      mappingKey = this.makeRelativeNodePath(selectedNode, closestArrayParent);
      const closestArrayParentExpression = closestArrayParent.data.expression || '';
      if (!hasMappedArrayParents || !closestArrayParentExpression.trim()) {
        return null;
      }
      if (hasMappedArrayParents) {
        // outputSchemas = this.nodeFactory.applyArrayFilterToJsonSchema(outputSchemas, mappedOutputArrays);
        lastMappedParent = <ArrayMappingInfo> [...mappedOutputArrays].reverse().find(p => isMappedParent(p));
      }
      mappings = this.getSubMappings(arrayParentsOfSelectedNode.concat(selectedNode), mappings);
    }

    const tree = this.nodeFactory.fromJsonSchema(outputSchemas,
      (treeNode: MapperTreeNode, level: number, path: string, parents: MapperTreeNode[]): MapperTreeNode => {
        const parentsAndCurrentNode = parents.concat(treeNode);
        treeNode.snippet = this.makeSnippet(parentsAndCurrentNode);
        return treeNode;
        // ******** FOLLOWING CODE not applicable for first pass of the mapper ********
        // const isCurrentNodeArray = treeNode.dataType === 'array';
        // const paths = parentsAndCurrentNode.map((node: MapperTreeNode, index, array) => {
        //   const nodeName = node.data.nodeName;
        //
        //   if (index === array.length - 1) {
        //     return (selectedNode.dataType !== 'array' && node.dataType === 'array')  ? `${nodeName}[0]` : nodeName;
        //   }
        //   return (node.dataType === 'array')  ? `${nodeName}[0]` : nodeName;
        // });
        //
        // if (lastMappedParent && treeNode.path.indexOf(lastMappedParent.fullLinkedPath) === 0) {
        //   const itemsLinkedPathArraySyntax = lastMappedParent.fullLinkedPath.split('.').map((item, index) => paths[index]);
        //   treeNode.snippet = this.makeRelativeNodePath({path: paths.join('.')}, { path: itemsLinkedPathArraySyntax.join('.')});
        // } else {
        //   treeNode.snippet = paths.join('.');
        // }
        //
        // if (selectedNode.dataType === 'array') {
        //   const forEachParam = isCurrentNodeArray ? treeNode.snippet : '';
        //   treeNode.snippet = ArrayMappingHelper.applyExpressionForEach(forEachParam);
        // }
        // return treeNode;
      }
    );

    /// SYMBOL TABLE necessary for validation only, disabling for now
    const symbolTable = {};
    // const symbolTable = this.nodeFactory.fromJsonSchemaToSymbolTable(outputSchemas);
    // if (lastMappedParent && lastMappedParent.fullLinkedPath) {
    //   // set the relative path for the array mappings
    //   const { memberType, children } = lastMappedParent.fullLinkedPath.split('.')
    //     .reduce((currentSchema, pathPart) => currentSchema.children[pathPart], { children: symbolTable });
    //   symbolTable['$'] = { type: memberType, children };
    // }

    return {
      mappings,
      tree,
      mappingKey,
      mapRelativeTo: lastMappedParent && lastMappedParent.fullLinkedPath,
      symbolTable
    };
  }

  private makeSnippet(nodes: MapperTreeNode[]) {
    const [root, propName] = nodes;
    let expressionHead = '';
    let expressionTailParts;
    const resolver = root.data.rootType;
    const makeResolvable = expr => '$' + expr;

    if (resolver === 'trigger') {
      expressionHead = `${resolver}.`;
      expressionHead += propName ? propName.data.nodeName : '';
      expressionHead = makeResolvable(expressionHead);
      expressionTailParts = nodes.slice(2);
    } else if (resolver === 'activity') {
      expressionHead = `activity[${root.data.nodeName}].`;
      expressionHead += propName ? propName.data.nodeName : '';
      expressionHead = makeResolvable(expressionHead);
      expressionTailParts = nodes.slice(2);
    } else {
      const nodeName = root.data.nodeName;
      expressionHead = resolver ? makeResolvable(nodeName) : nodeName;
      expressionTailParts = nodes.slice(1);
    }
    return[expressionHead].concat(
      expressionTailParts.map(n => n.data.nodeName)
    ).join('.');
  }

  private extractLinkedOutputArrayPaths(arrayNodes: MapperTreeNode[], mappings: Mappings): ArrayMappingInfo[] {
    if (!arrayNodes || arrayNodes.length <= 0 || !mappings) {
      return [];
    }

    const nodes = [...arrayNodes];
    const rootArrayNode = nodes.shift();
    let mapping: IMapExpression = nodes ? mappings[rootArrayNode.path] : null;
    const isEmptyExpression = m => !m.expression || !m.expression.trim();
    if (!mapping || isEmptyExpression(mapping)) {
      return [];
    }

    let prevNode = rootArrayNode;
    let node = nodes.shift();

    const linkedArrayPaths = [];
    let processedExpression = ArrayMappingHelper.processExpressionForEach(<string>mapping.expression);
    processedExpression.node = rootArrayNode;
    processedExpression.fullLinkedPath = mapping.parsedExpressionDetails.memberReferences[0];
    linkedArrayPaths.push(processedExpression);

    while (mapping && node) {
      const relativePath = this.makeRelativeNodePath(node, prevNode);
      mapping = mapping.mappings ? mapping.mappings[relativePath] : null;
      if (mapping && !isEmptyExpression(mapping)) {
        processedExpression = ArrayMappingHelper.processExpressionForEach(<string>mapping.expression);
        processedExpression.node = node;
        const hasMemberReferences = mapping.parsedExpressionDetails && mapping.parsedExpressionDetails.memberReferences;
        processedExpression.fullLinkedPath = hasMemberReferences ? mapping.parsedExpressionDetails.memberReferences[0] : relativePath;
        linkedArrayPaths.push(processedExpression);
      }
      prevNode = node;
      node = nodes.shift();
    }
    return linkedArrayPaths;
  }

  // will create it if it doesn't exist
  private getSubMappings(arrayNodes: MapperTreeNode[], mappings: Mappings): Mappings {
    const resultSubmappings = arrayNodes.slice(0).reverse()
      .map((node: MapperTreeNode, i: number, nodes: MapperTreeNode[]) => {
        const parentArrayNode = nodes[i + 1];
        if (parentArrayNode) {
          return this.makeRelativeNodePath(node, parentArrayNode);
        }
        return node.path;
      })
      .reverse()
      .reduce<{ mappings: Mappings }>(
        (submapping: { mappings: Mappings }, arrayPath: string, currentIndex: number, paths: string[]) => {
          if (paths[currentIndex + 1]) {
            if (!submapping.mappings[arrayPath]) {
              submapping.mappings[arrayPath] = <any>{
                expression: '',
                mappings: <any> {},
              };
            }
            submapping = <{ mappings: Mappings }><any> submapping.mappings[arrayPath];
          }
          return submapping;
        }, { mappings });

    return resultSubmappings.mappings;
  }

  // TODO: add actual parsing
  private processArrayMapExpression(expression: string) {
    return ArrayMappingHelper.processExpressionForEach(expression);
  }

  private makeRelativeNodePath(childNode: MapperTreeNode, parentNode: { path?: string }) {
    // a.b.c.x.y - a.b.c = $.x.y
    return '$' + childNode.path.slice(parentNode.path.length);
  }


  private getInitialState(): MapperState {
    return {
      context: null,
      hasMappings: false,
      currentSelection: null,
      mappings: {},
      inputs: {
        filterTerm: null,
        nodes: [],
      },
      outputs: {
        filterTerm: null,
        nodes: [],
      },
      functions: {
        filterTerm: null,
        nodes: [],
      },
    };
  }
}
