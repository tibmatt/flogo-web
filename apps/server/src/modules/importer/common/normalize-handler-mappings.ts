import { isString } from 'lodash';
import { parse, parseResolver } from '@flogo-web/parser';
import { MAPPING_EXPRESSION_TYPE } from '../../../common/constants';

const CURRENT_SCOPE_RESOLVER = '$';

export function normalizeHandlerMappings(handler) {
  if (!handler.actionMappings) {
    return handler;
  }
  let { input, output } = handler.actionMappings;
  input = input && input.map(normalizeSingleHandlerMapping);
  output = output && output.map(normalizeSingleHandlerMapping);
  return { ...handler, actionMappings: { input, output } };
}

/**
 * @param {object} mapping
 * @param {any} mapping.value
 * @param {string} mapping.type
 * @param {string} mapping.mapTo
 * @return {object} mapping
 * */
export function normalizeSingleHandlerMapping(mapping) {
  const isProcessable =
    isString(mapping.value) && mapping.type === MAPPING_EXPRESSION_TYPE.ASSIGN;
  if (isProcessable && shouldPrefixWithScopeResolver(mapping.value)) {
    const value = `${CURRENT_SCOPE_RESOLVER}.${mapping.value.trim()}`;
    return { ...mapping, value };
  }
  return mapping;
}

function shouldPrefixWithScopeResolver(expression) {
  const { ast } = parse(expression);
  if (ast && ast.type === 'ExprStmt') {
    const { x: exprNode } = ast as any; // as ExprStmt;
    const headNode = getAssignExpressionHead(exprNode);
    return !!headNode && headNode.type === 'Identifier';
  }
  return false;
}

function getAssignExpressionHead(node) {
  let currentNode = node;
  while (currentNode) {
    switch (currentNode.type) {
      case 'Identifier':
      case 'ScopeResolver':
        // terminal nodes, we reached the head
        return currentNode;
      case 'SelectorExpr':
      case 'IndexExpr':
        currentNode = currentNode.x;
        break;
      default:
        // not an assign expression
        return null;
    }
  }
  return null;
}
