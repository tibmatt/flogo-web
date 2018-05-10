import { isEmpty, mapValues } from 'lodash';
import { ContribSchema, Dictionary, FlowGraph, GraphNode, Item } from '../../../../core/index';
import { FlowState } from '../flow.state';
import { PayloadOf } from '../utils';
import { Init } from '../flow.actions';
import { validateAll } from '../../models/flow/validate-item';

export function init(state: FlowState, payload: PayloadOf<Init>) {
  return {
    ...state,
    ...payload,
    mainGraph: validateAndApplyErrors(payload.schemas, payload.mainItems, payload.mainGraph),
    errorGraph: validateAndApplyErrors(payload.schemas, payload.errorItems, payload.errorGraph),
  };
}

function validateAndApplyErrors(schemas: Dictionary<ContribSchema>, items: Dictionary<Item>, graph: FlowGraph) {
  const errors = validateAll(schemas, items) || {};
  return {
    ...graph,
    nodes: applyErrorsToNodes(errors, graph.nodes),
  };
}

function applyErrorsToNodes(errors: {[itemId: string]: any }, nodes: Dictionary<GraphNode>) {
  return mapValues(nodes, (node) => {
    const errorsForNode = errors[node.id];
    if (isEmpty(errorsForNode)) {
      return node;
    }
    return {
      ...node,
      status: {
        ...node.status,
        invalid: true,
        errors: errorsForNode,
      }
    };
  });
}
