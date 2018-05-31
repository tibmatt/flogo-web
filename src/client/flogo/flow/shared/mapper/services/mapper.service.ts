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

export interface MapperState {
  context: MapperContext;
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

const isSameEditingExpression = (prev: EditingExpression, next: EditingExpression) => {
  if (!prev && next || !next && prev) {
    return false;
  }
  return prev.expression === next.expression && prev.mappingType === next.mappingType;
};

@Injectable()
export class MapperService {

  currentState: MapperState;
  state: ReplaySubject<MapperState> = new ReplaySubject(1);

  constructor(private nodeFactory: TreeNodeFactoryService,
              private treeService: TreeService,
  ) {}

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

  expressionChange(value: EditingExpression) {
    const state = this.applyExpressionChange(this.currentState, value);
    this.updateState(state);
  }

  private updateState(state: MapperState) {
    this.currentState = state;
    this.state.next(state);
  }

  private getSelectionContext(node: MapperTreeNode, state: MapperState)
    : [OutputContext, { treeNodes: MapperTreeNode[], symbolTable: any }] {
    if (node) {
      return [
        this.makeOutputContext(node, state.context.outputSchemas, state.mappings),
        {
          treeNodes: this.nodeFactory.fromFunctions(state.context.functions),
          symbolTable: <any> this.nodeFactory.fromFunctionsToSymbolTable(state.context.functions),
        }
      ];
    } else {
      return [ <any>{}, <any>{} ];
    }
  }

  private applyInputSelection(node: MapperTreeNode): MapperState {
    const state = this.currentState;
    const [outputContext, functions] = this.getSelectionContext(node, state);

    let currentSelection: CurrentSelection = null;
    if (node && node.data) {
      if (!outputContext) {
        return {
          ...state,
          currentSelection: { mappingKey: null },
          functions: { filterTerm: '', nodes: [] },
          outputs: { filterTerm: '', nodes: [] },
        };
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
      const parseResult = <any>{};
      currentSelection.errors = parseResult.errors && parseResult.errors.length > 0 ? parseResult.errors : null;
    }

    return {
      ...state,
      currentSelection,
      functions: { filterTerm: '', nodes: functions.treeNodes },
      outputs: { filterTerm: '', nodes: outputContext.tree },
    };
  }

  private setupContextChange(context: MapperContext) {
    const newState = this.getInitialState();
    newState.context = context;
    newState.mappings = context.mappings || {};
    newState.hasMappings = this.hasMappings(newState.mappings);
    const flattenedMappings = this.nodeFactory.flatMappings(newState.mappings);
    newState.inputs.nodes = this.nodeFactory.fromJsonSchema(context.inputSchemas,
      (treeNode: MapperTreeNode, level, path, parents: MapperTreeNode[]) => {
        treeNode.data.level = level;
        const expression = flattenedMappings[path];
        treeNode.data.expression = expression || null;
        return treeNode;
      });
    // todo: improve for performance
    newState.inputs.nodes.forEach(node => this.treeService.updateTreeMappingStatus(node));
    this.updateState(newState);
  }

  private applyExpressionChange(state: MapperState, editingExpression: EditingExpression): MapperState {
    const currentSelection = state.currentSelection;
    if (isSameEditingExpression(currentSelection.editingExpression, editingExpression)) {
      return state;
    }
    const node = currentSelection.node;
    const expression = editingExpression.expression;
    node.data = { ...node.data, expression };
    node.isInvalid = expression && expression.trim() && !resolveExpressionType(expression);
    const mappings = this.updateMapping(state.mappings, currentSelection.mappingKey, editingExpression);

    return {
      ...state,
      hasMappings: this.hasMappings(state.mappings),
      ...mappings,
      currentSelection: {
        ...currentSelection,
        editingExpression
      }
    };
  }

  private updateMapping(
    mappings: Mappings,
    path: string,
    editingExpression: EditingExpression,
    parsedExpressionDetails?: ParsedExpressionDetails
  ) {
    const existingMapping = mappings[path];
    const isEmptyExpression = !editingExpression || !editingExpression.expression || !editingExpression.expression.trim();
    if (isEmptyExpression && !existingMapping) {
      return mappings;
    }
    if (existingMapping && isEmptyExpression) {
      const { newMappings, [path]: mappingToRemove } = mappings;
      return newMappings;
    }
    const subMappings = existingMapping ? existingMapping.mappings : {};
    return {
      ...mappings,
      [path]: {
        expression: editingExpression.expression,
        mappingType: editingExpression.mappingType,
        mappings: subMappings,
        parsedExpressionDetails,
      },
    };
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
