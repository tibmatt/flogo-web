import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/withLatestFrom';

import { TreeNodeFactoryService } from './tree-node-factory.service';
import { TreeService } from './tree.service';
import { ExpressionProcessorService } from './expression-processor.service';
import {
  IMapExpression,
  IMapFunctionsLookup,
  IMapperContext,
  ISchemaProvider
} from '../models/map-model';
import { MapperTreeNode } from '../models/mapper-treenode.model';

import { ArrayMappingHelper, ArrayMappingInfo } from '../models/array-mapping';
import { IParsedExpressionDetails } from '../models/map-model';

export interface TreeState {
  filterTerm: string | null;
  nodes: MapperTreeNode[];
}

export interface CurrentSelection {
  node?: MapperTreeNode;
  expression?: string;
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
  private expressionChangeSrc: Subject<string> = new Subject<string>();

  constructor(private nodeFactory: TreeNodeFactoryService,
              private treeService: TreeService,
              private parserService: ExpressionProcessorService) {

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

  expressionChange(expression: string) {
    this.expressionChangeSrc.next(expression);
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
            expression: mapping ? <string>mapping.expression : '',
            mappings: outputContext.mappings,
            mappingKey: outputContext.mappingKey,
            mapRelativeTo: outputContext.mapRelativeTo,
          };

          let expectedResultType = { type: node.dataType, array: false };
          if (node.dataType === 'array') {
            expectedResultType = { array: true, type: node.memberType || 'object' };
          }
          expectedResultType.type = expectedResultType.type === 'date' ? 'string' : expectedResultType.type;
          const parseResult = this.parserService.processExpression(currentSelection.expression,
            expectedResultType, currentSelection.symbolTable, outputContext.mapRelativeTo);
          currentSelection.errors = parseResult.errors && parseResult.errors.length > 0 ? parseResult.errors : null;
        }

        return (state: MapperState) => Object.assign({}, state, {
          currentSelection,
          inputs: { nodes: this.treeService.selectNode(state.inputs.nodes, node ? node.path : null) },
          functions: { filterTerm: '', nodes: node.dataType !== 'object' ? functions.treeNodes : [] },
          outputs: { filterTerm: '', nodes: node.dataType !== 'object' ? outputContext.tree : [] },
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
          newState.inputs.nodes = this.nodeFactory.fromJsonSchema(inputSchemas, (treeNode: MapperTreeNode, level, path) => {
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
    this.expressionChangeSrc
      .withLatestFrom(
        this.state.map((state: MapperState) => state.currentSelection && state.currentSelection.node).distinctUntilChanged(),
        (expression: string, currentNode: MapperTreeNode) => ({ expression, currentNode })
      )
      .distinctUntilChanged((prev, next) => prev.expression === next.expression && prev.currentNode === next.currentNode)
      .map(({ expression }) => expression)
      .map(expression => (state: MapperState) => {
        const currentSelection = state.currentSelection;
        const node = currentSelection.node;
        node.data.expression = expression;
        currentSelection.expression = expression;

        let expectedResultType = { type: node.dataType, array: false };
        if (node.dataType === 'array') {
          expectedResultType = { array: true, type: node.memberType || 'object' };
        }
        expectedResultType.type = expectedResultType.type === 'date' ? 'string' : expectedResultType.type;

        const parseResult = this.parserService.processExpression(state.currentSelection.expression,
          expectedResultType,
          state.currentSelection.symbolTable, state.currentSelection.mapRelativeTo);
        state.currentSelection.errors = parseResult.errors && parseResult.errors.length > 0 ? parseResult.errors : null;

        this.updateMapping(currentSelection.mappings, currentSelection.mappingKey, expression, parseResult.structureDetails);

        state.hasMappings = this.hasMappings(state.mappings);

        // this.treeService.updateMappingStatus(node);
        this.treeService.propagateMappingStatusToParents(node);

        return Object.assign({}, state);
      })
      .subscribe(this.updatesSrc);
  }

  private updateMapping(mappings: Mappings, path: string, expression: string, parsedExpressionDetails?: IParsedExpressionDetails) {
    const existingMapping = mappings[path];
    const isEmptyExpression = !expression || !expression.trim();
    if (existingMapping) {
      if (!isEmptyExpression) {
        existingMapping.expression = expression;
        existingMapping.parsedExpressionDetails = parsedExpressionDetails;
      } else {
        delete mappings[path];
      }
    } else if (!isEmptyExpression) {
      // todo: check types
      mappings[path] = <any>{
        expression,
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
      const submappings = this.getSubMappings(arrayParentsOfSelectedNode.concat(selectedNode), mappings);
      mappings = submappings;
    }

    const tree = this.nodeFactory.fromJsonSchema(outputSchemas,
      (treeNode: MapperTreeNode, level: number, path: string): MapperTreeNode => {
        const isCurrentNodeArray = treeNode.dataType === 'array';

        if (lastMappedParent && treeNode.path.indexOf(lastMappedParent.fullLinkedPath) === 0) {
          treeNode.snippet = this.makeRelativeNodePath(treeNode, { path: lastMappedParent.fullLinkedPath });
        }

        if (selectedNode.dataType === 'array') {
          const forEachParam = isCurrentNodeArray ? treeNode.snippet : '';
          treeNode.snippet = ArrayMappingHelper.applyExpressionForEach(forEachParam);
        }

        if (treeNode.dataType === 'array' && selectedNode.dataType !== 'array') {
          treeNode.snippet = `${treeNode.snippet}[]`;
        }

        return treeNode;
      }
    );

    const symbolTable = this.nodeFactory.fromJsonSchemaToSymbolTable(outputSchemas);
    if (lastMappedParent && lastMappedParent.fullLinkedPath) {
      // set the relative path for the array mappings
      const { memberType, children } = lastMappedParent.fullLinkedPath.split('.')
        .reduce((currentSchema, pathPart) => currentSchema.children[pathPart], { children: symbolTable });
      symbolTable['$'] = { type: memberType, children };
    }

    return {
      mappings,
      tree,
      mappingKey,
      mapRelativeTo: lastMappedParent && lastMappedParent.fullLinkedPath,
      symbolTable
    };
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
