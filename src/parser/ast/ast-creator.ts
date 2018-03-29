/**
 * Based on golang's AST package
 * https://godoc.org/go/ast
 */

import { CstNode, ICstVisitor, IToken } from 'chevrotain';
import { Node } from './node';
import * as JsonNodes from './json-nodes';
import * as ExprNodes from './expr-nodes';

interface CstVisitorBase {
  new (...args: any[]): ICstVisitor<CstNode, Node | Node[]>;
}

type PrimaryExprNode = ExprNodes.BasicLit | ExprNodes.Identifier | ExprNodes.SelectorExpr | ExprNodes.IndexExpr | ExprNodes.CallExpr;
type PrimaryExprAstNode = ExprNodes.SelectorExpr | ExprNodes.IndexExpr | ExprNodes.CallExpr;

const literalTypeMap = {StringLiteral: 'string', NumberLiteral: 'number', True: 'boolean', False: 'boolean', Null: 'null'};
const makeLiteralJsonNode = (cstToken: IToken): JsonNodes.LiteralNode => {
  const value = JSON.parse(cstToken.image);
  const tokenName = cstToken.tokenType.tokenName;
  return {
    type: 'jsonLiteral',
    kind: literalTypeMap[tokenName],
    value,
    raw: cstToken.image,
  };
};

const isSelectorNode = (node: PrimaryExprNode): node is ExprNodes.SelectorExpr => node.type === 'SelectorExpr';

export function astCreatorFactory(BaseCstVisitorClass: CstVisitorBase) {
  class AstConstructor extends BaseCstVisitorClass {
    constructor() {
      super();
      // This helper will detect any missing or redundant methods on this visitor
      this.validateVisitor();
    }

    mappingExpression(ctx): ExprNodes.ExprStmt | JsonNodes.JsonNode {
      const expression = <ExprNodes.Expr> this.visit(ctx.expression);
      if (expression) {
        return {
          type: 'ExprStmt',
          x: expression
        };
      }
      return <JsonNodes.JsonNode> this.visit(ctx.json);
    }

    programNoExpression(ctx) {
      let rule = null;
      if (ctx.json[0]) {
        rule = ctx.json;
      } else if (ctx.attrAccess[0]) {
        rule = ctx.attrAccess;
      } else {
        rule = ctx.literal;
      }
      return this.visit(rule);
    }

    attrAccess(ctx) {
      const operand = <ExprNodes.ScopeResolver | ExprNodes.Identifier> this.visit(ctx.operandHead);
      if (ctx.primaryExprTail.length > 0) {
        return this.$createPrimaryExprHierarchy(ctx.primaryExprTail, operand);
      } else {
        return operand;
      }
    }

    // todo: check precedence order
    expression(ctx): ExprNodes.Expr {
      const baseExpr = <ExprNodes.Expr> this.visit(ctx.unaryExpr);
      if (ctx.binaryExprSide) {
        return ctx.binaryExprSide
          .map(cstNode => <ExprNodes.BinaryExpr> this.visit(cstNode))
          .reduce((leftOperator: ExprNodes.BinaryExpr, binaryExpr: ExprNodes.BinaryExpr) => {
            binaryExpr.x = leftOperator;
            return binaryExpr;
          }, baseExpr);
      }
    }

    binaryExprSide(ctx): ExprNodes.BinaryExpr {
      return {
        type: 'BinaryExpr',
        x: null,
        operator: ctx.BinaryOp[0].image,
        y: <ExprNodes.Expr> this.visit(ctx.expression),
      };
    }

    literal(ctx) {
      const cstNodeType = this.$findCstNodeTypeFromContext(ctx);
      const cstToken = ctx[cstNodeType][0];
      const value = JSON.parse(cstToken.image);
      const tokenName = cstToken.tokenType.tokenName;
      return {
        type: 'BasicLit',
        kind: literalTypeMap[tokenName],
        value,
        raw: cstToken.image,
      };
    }

    primaryExpr(ctx): PrimaryExprNode {
      const operand = <ExprNodes.BasicLit | ExprNodes.Identifier> this.visit(ctx.operand);
      if (ctx.primaryExprTail.length > 0) {
        return this.$createPrimaryExprHierarchy(ctx.primaryExprTail, operand);
      } else {
        return operand;
      }
    }

    primaryExprTail(ctx): ExprNodes.SelectorExpr | ExprNodes.IndexExpr | ExprNodes.CallExpr {
      if (ctx.selector[0]) {
        return <ExprNodes.SelectorExpr> this.visit(ctx.selector);
      } else if (ctx.index[0]) {
        return <ExprNodes.IndexExpr> this.visit(ctx.index);
      } else {
        return <ExprNodes.CallExpr> this.visit(ctx.argumentList);
      }
    }

    unaryExpr(ctx): ExprNodes.Expr {
      const primaryExpr = <PrimaryExprNode> this.visit(ctx.primaryExpr);
      if (primaryExpr) {
        return primaryExpr;
      }
      return <ExprNodes.UnaryExpr> this.visit(ctx.unaryExprOperation);
    }

    unaryExprOperation(ctx): ExprNodes.UnaryExpr {
      return {
        type: 'UnaryExpr',
        operator: ctx.UnaryExpr[0].image,
        x: <ExprNodes.Expr> this.visit(ctx.UnaryExpr)
      };
    }

    operand(ctx) {
      return this.visit(ctx.literal) || this.visit(ctx.operandHead);
    }

    operandHead(ctx): ExprNodes.Identifier | ExprNodes.ScopeResolver {
      if (ctx.IdentifierName[0]) {
        return {
          type: 'Identifier',
          name: ctx.IdentifierName[0].image,
        };
      }
      return <ExprNodes.ScopeResolver> this.visit(ctx.resolver);
    }

    resolver(ctx): ExprNodes.ScopeResolver {
      const resolverNode = <ExprNodes.ScopeResolver> {
        type: 'ScopeResolver',
      };

      const resolverSelector = <any> this.visit(ctx.resolverSelector);
      const { name, selector } = resolverSelector || <any>{};
      if (name) {
        resolverNode.name = name.image;
      }
      if (selector) {
        resolverNode.sel = selector.image;
      }
      return resolverNode;
    }

    resolverSelector(ctx): { name: string, selector?: string } {
      const [name, selector] = ctx.IdentifierName;
      const resolverSelector: { name: string, selector?: string } = { name };
      if (selector) {
        resolverSelector.selector = selector;
      }
      return resolverSelector;
    }

    selector(ctx): ExprNodes.SelectorExpr {
      return {
        type: 'SelectorExpr',
        x: null,
        sel: ctx.IdentifierName[0].image,
      };
    }

    index(ctx): ExprNodes.IndexExpr {
      return {
        type: 'IndexExpr',
        x: null,
        index: parseInt(ctx.NumberLiteral[0].image, 10),
      };
    }

    argumentList(ctx): ExprNodes.CallExpr {
      const args = ctx.expression.map(exprNode => this.visit(exprNode));
      return {
        type: 'CallExpr',
        fun: null,
        args,
      };
    }

    json(ctx): JsonNodes.JsonNode {
      const value = <any> this.visit(ctx.object) || this.visit(ctx.array);
      return {
        type: 'json',
        value,
      };
    }

    array(ctx): JsonNodes.ArrayNode {
      return {
        type: 'jsonArray',
        children: ctx.value.map(valueNode => this.visit(valueNode)),
      };
    }

    object(ctx): JsonNodes.ObjectNode {
      return {
        type: 'jsonObject',
        children: ctx.objectItem.map(item => this.visit(item)),
      };
    }

    objectItem(ctx): JsonNodes.PropertyNode {
      const key = JSON.parse(ctx.StringLiteral[0].image);
      const value = <JsonNodes.ValueNode> this.visit(ctx.value);
      return {
        type: 'jsonProperty',
        key,
        value,
      };
    }

    value(ctx): JsonNodes.ValueNode {
      const cstNodeType = this.$findCstNodeTypeFromContext(ctx);
      if (cstNodeType === 'object' || cstNodeType === 'array' || cstNodeType === 'stringTemplate' ) {
        return <JsonNodes.ObjectNode | JsonNodes.ArrayNode> this.visit(ctx[cstNodeType]);
      } else {
        return makeLiteralJsonNode(ctx[cstNodeType][0]);
      }
    }

    stringTemplate(ctx): JsonNodes.StringTemplateNode {
      return {
        type: 'stringTemplate',
        expression: <ExprNodes.Expr> this.visit(ctx.expression),
      };
    }

    // $ suffix is required for helpers
    private $findCstNodeTypeFromContext(ctx) {
      return Object.keys(ctx).find(key => ctx[key][0]);
    }

    // $ suffix is required for helpers
    private $createPrimaryExprHierarchy(primaryExprTailNodes: CstNode[], operand) {
      return primaryExprTailNodes
        .map(cstTailNode => this.visit(cstTailNode))
        .reduce((member: PrimaryExprAstNode, selector: PrimaryExprAstNode) => {
          if (selector.type === 'CallExpr') {
            const callExprNode = <ExprNodes.CallExpr> selector;
            callExprNode.fun = member;
            return callExprNode;
          } else {
            selector.x = member;
            return selector;
          }
        }, operand);

    }

  }

  return AstConstructor;
}
