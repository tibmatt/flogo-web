import { Injectable } from '@angular/core';

import { ReplaySubject } from 'rxjs/ReplaySubject';
import { resolveExpressionType } from 'flogo-parser';

import { TreeNodeFactoryService } from './tree-node-factory.service';
import { TreeService } from './tree.service';
import { MapExpression } from '../models/map-model';
import { MapperTreeNode } from '../models/mapper-treenode.model';

import { ArrayMappingHelper, ArrayMappingInfo } from '../models/array-mapping';
import { ParsedExpressionDetails, MapperContext, Mappings } from '../models';
import { TYPE_ATTR_ASSIGNMENT, ROOT_TYPES } from '../constants';
import { Observable } from 'rxjs/Observable';

export interface TreeState {
  filterTerm: string | null;
  nodes: MapperTreeNode[];
}

export interface InputTreeState {
  filterTerm: string | null;
  nodes: { [path: string]: MapperTreeNode };
}

export interface MapperState {
  context: MapperContext;
  mappings: Mappings;
  mappingKey?: string;
  inputs: InputTreeState;
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

const isSameEditingExpression = (prev: { expression: string }, next: { expression: string }) => {
  if (!prev && next || !next && prev) {
    return false;
  }
  return prev.expression === next.expression;
};

@Injectable()
export class MapperService {

  currentState: MapperState;
  state$: Observable<MapperState>;
  private stateSrc: ReplaySubject<MapperState>;

  constructor(private nodeFactory: TreeNodeFactoryService,
              private treeService: TreeService,
  ) {
    this.stateSrc = new ReplaySubject<MapperState>(1);
    this.state$ = this.stateSrc.asObservable();
  }

  setContext(context: MapperContext) {
    this.setupContextChange(context);
  }

  selectInput(node: MapperTreeNode) {
    const state = this.applyInputSelection(node);
    this.updateState(state);
  }

  filterInputs(filterTerm: string) {
    const state = this.currentState;
    this.updateState({
      ...state,
      inputs: {
        ...state.inputs,
        filterTerm,
      },
    });
  }

  filterOutputs(filterTerm: string) {
    this.updateState({ ...this.currentState, outputs: this.applyTreeFilter(filterTerm, this.currentState.outputs) });
  }

  filterFunctions(filterTerm: string) {
    const state = this.currentState;
    this.updateState({
      ...state,
      functions: this.applyTreeFilter(filterTerm, state.functions)
    });
  }

  expressionChange(nodePath: string, expression: string) {
    const state = this.applyExpressionChange(this.currentState, { nodePath, expression });
    this.updateState(state);
  }

  private updateState(state: MapperState) {
    this.currentState = state;
    this.stateSrc.next(state);
  }

  private getSelectionContext(node: MapperTreeNode, state: MapperState)
    : { functions: MapperTreeNode[], outputs: MapperTreeNode[] } {
    if (node) {
      const outputContext = this.makeOutputContext(node, state.context.outputSchemas, state.mappings);
      return {
        outputs: outputContext.tree,
        functions: this.nodeFactory.fromFunctions(state.context.functions),
      };
    } else {
      return { functions: [], outputs: [] };
    }
  }

  private applyInputSelection(node: MapperTreeNode): MapperState {
    const state = this.currentState;
    const { functions, outputs } = this.getSelectionContext(node, state);
    return {
      ...state,
      mappingKey: node.path,
      functions: { filterTerm: '', nodes: functions },
      outputs: { filterTerm: '', nodes: outputs },
    };
  }

  private setupContextChange(context: MapperContext) {
    const newState = this.getInitialState();
    newState.context = context;
    newState.mappings = context.mappings || {};
    const flattenedMappings = this.nodeFactory.flatMappings(newState.mappings);
    const nodeList = this.nodeFactory.fromJsonSchema(context.inputSchemas,
      (treeNode: MapperTreeNode, level, path, parents: MapperTreeNode[]) => {
        treeNode.data.level = level;
        const expression = flattenedMappings[path];
        treeNode.data.expression = expression || null;
        return treeNode;
      });
    const [firstNode] = nodeList;
    newState.mappingKey = firstNode ? firstNode.path : null;
    if (firstNode) {
      newState.mappingKey = firstNode.path;
      const { outputs, functions } = this.getSelectionContext(firstNode, newState);
      newState.outputs.nodes = outputs;
      newState.functions.nodes = functions;
    }
    newState.inputs.nodes = nodeList.reduce((nodes, node) => {
        nodes[node.path] = node;
        return nodes;
      }, {} as {[path: string]: MapperTreeNode});
    this.updateState(newState);
  }

  private applyExpressionChange(state: MapperState, { nodePath, expression }: {nodePath: string, expression: string}): MapperState {
    const mappingsForNode = state.mappings[nodePath];
    if (isSameEditingExpression(mappingsForNode, { expression })) {
      return state;
    }
    const currentNode = state.inputs.nodes[nodePath];
    const mappings = this.updateMapping(state.mappings, nodePath, expression);
    const isExpressionInvalid = expression && expression.trim() && !resolveExpressionType(expression);
    return {
      ...state,
      mappings,
      inputs: {
        ...state.inputs,
        nodes: {
          ...state.inputs.nodes,
          [nodePath]: {
            ...currentNode,
            data: {
              ...currentNode.data,
              expression,
            },
            isInvalid: isExpressionInvalid,
          }
        }
      },
    };
  }

  private updateMapping(
    mappings: Mappings,
    path: string,
    expression: string,
    parsedExpressionDetails?: ParsedExpressionDetails
  ): Mappings {
    const existingMapping = mappings[path];
    const isEmptyExpression = !expression || !expression.trim();
    if (isEmptyExpression && !existingMapping) {
      return mappings;
    }
    if (existingMapping && isEmptyExpression) {
      const { [path]: mappingToRemove, ...newMappings } = mappings;
      return newMappings;
    }
    const subMappings = existingMapping ? existingMapping.mappings : {};
    return {
      ...mappings,
      [path]: {
        expression,
        mappings: subMappings,
        parsedExpressionDetails,
      },
    };
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
      }
    );

    /// SYMBOL TABLE necessary for validation only, disabling for now
    const symbolTable = {};
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
    const nodeName = root.data.nodeName;
    const makeResolvable = expr => '$' + expr;

    if (resolver === ROOT_TYPES.TRIGGER || resolver === ROOT_TYPES.ERROR) {
      expressionHead = `${resolver}.`;
      expressionHead += propName ? propName.data.nodeName : '';
      expressionHead = makeResolvable(expressionHead);
      expressionTailParts = nodes.slice(2);
    } else if (resolver === ROOT_TYPES.ACTIVITY) {
      expressionHead = `${ROOT_TYPES.ACTIVITY}[${root.data.nodeName}].`;
      expressionHead += propName ? propName.data.nodeName : '';
      expressionHead = makeResolvable(expressionHead);
      expressionTailParts = nodes.slice(2);
    } else if (resolver === ROOT_TYPES.FLOW) {
      expressionHead = makeResolvable(nodeName);
      expressionTailParts = nodes.slice(1);
    } else {
      expressionHead = nodeName.indexOf('$') === -1 ? '$.' + nodeName : nodeName;
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
    let mapping: MapExpression = nodes ? mappings[rootArrayNode.path] : null;
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

  private makeRelativeNodePath(childNode: MapperTreeNode, parentNode: { path?: string }) {
    // a.b.c.x.y - a.b.c = $.x.y
    return '$' + childNode.path.slice(parentNode.path.length);
  }

  private getInitialState(): MapperState {
    return {
      context: null,
      mappings: {},
      inputs: {
        filterTerm: null,
        nodes: {},
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
