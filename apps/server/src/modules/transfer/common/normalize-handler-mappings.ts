import { isString, isPlainObject } from 'lodash';
import { parse } from '@flogo-web/parser';
import { EXPR_PREFIX } from '@flogo-web/core';
import { MAPPING_EXPRESSION_TYPE } from '@flogo-web/server/core';

const CURRENT_SCOPE_RESOLVER = '$';
const mappingsReducer = (reducedMappings, mapping) => {
  let value = mapping.value;
  if (isPlainObject(mapping.value)) {
    value = EXPR_PREFIX + JSON.stringify(mapping.value);
  } else if (mapping.type !== MAPPING_EXPRESSION_TYPE.LITERAL) {
    value = EXPR_PREFIX + mapping.value;
  }
  reducedMappings[mapping.mapTo] = value;
  return reducedMappings;
};

export function normalizeHandlerMappings(handler) {
  if (!handler.actionMappings) {
    return handler;
  }
  let { input, output } = handler.actionMappings;
  input = input && input.map(normalizeSingleHandlerMapping).reduce(mappingsReducer, {});
  output =
    output && output.map(normalizeSingleHandlerMapping).reduce(mappingsReducer, {});
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
