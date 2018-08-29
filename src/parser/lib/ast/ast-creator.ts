/**
 * Based on golang's AST package
 * https://godoc.org/go/ast
 */

import { CstNode, ICstVisitor } from 'chevrotain';
import { Node } from './node';
import * as JsonNodes from './json-nodes';
import * as ExprNodes from './expr-nodes';
import { makeLiteralNode } from './make-literal-node';

export interface CstVisitorBase {
  new (...args: any[]): ICstVisitor<CstNode, Node | Node[]>;
}

type PrimaryExprNode = ExprNodes.BasicLit | ExprNodes.Identifier | ExprNodes.SelectorExpr | ExprNodes.IndexExpr | ExprNodes.CallExpr;
type PrimaryExprAstNode = ExprNodes.SelectorExpr | ExprNodes.IndexExpr | ExprNodes.CallExpr;

export function astCreatorFactory(BaseCstVisitorClass: CstVisitorBase): CstVisitorBase {
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

    attrAccess(ctx) {
      const operand = <ExprNodes.ScopeResolver | ExprNodes.Identifier> this.visit(ctx.operandHead);
      if (ctx.primaryExprTail) {
        return this.$createPrimaryExprHierarchy(ctx.primaryExprTail, operand);
      } else {
        return operand;
      }
    }

    expression(ctx): ExprNodes.Expr | ExprNodes.TernaryExpr {
      const expr = this.visit(ctx.baseExpr) as ExprNodes.Expr;
      if (!ctx.ternaryExpr) {
        return expr;
      }
      return this.visit(ctx.ternaryExpr, <any>expr) as ExprNodes.TernaryExpr;
    }

    // todo: check precedence order
    baseExpr(ctx): ExprNodes.Expr {
      const expr = (ctx.parenExpr ? this.visit(ctx.parenExpr) : this.visit(ctx.unaryExpr)) as ExprNodes.Expr;
      if (!ctx.binaryExprSide) {
        return expr;
      }
      return this.$reduceToBinaryExpression(ctx, expr);
    }

    binaryExprSide(ctx): ExprNodes.BinaryExpr {
      return {
        type: 'BinaryExpr',
        x: null,
        operator: ctx.BinaryOp[0].image,
        y: <ExprNodes.Expr> this.visit(ctx.baseExpr),
      };
    }

    literal(ctx) {
      const cstNodeType = this.$findCstNodeTypeFromContext(ctx);
      const cstToken = ctx[cstNodeType][0];
      return makeLiteralNode('BasicLit', cstToken);
    }

    primaryExpr(ctx): PrimaryExprNode {
      const operand = <ExprNodes.BasicLit | ExprNodes.Identifier> this.visit(ctx.operand);
      if (ctx.primaryExprTail) {
        return this.$createPrimaryExprHierarchy(ctx.primaryExprTail, operand);
      } else {
        return operand;
      }
    }

    parenExpr(ctx): ExprNodes.ParenExpr {
      return {
        type: 'ParenExpr',
        expr: this.visit(ctx.baseExpr) as ExprNodes.Expr,
      };
    }

    ternaryExpr(ctx, condition: ExprNodes.Expr): ExprNodes.TernaryExpr {
      const [consequent, alternate] = ctx.baseExpr;
      return {
        type: 'TernaryExpr',
        condition,
        consequent: this.visit(consequent) as ExprNodes.Expr,
        alternate: this.visit(alternate) as ExprNodes.Expr,
      };
    }

    primaryExprTail(ctx): ExprNodes.SelectorExpr | ExprNodes.IndexExpr | ExprNodes.CallExpr {
      if (ctx.selector) {
        return <ExprNodes.SelectorExpr> this.visit(ctx.selector);
      } else if (ctx.index) {
        return <ExprNodes.IndexExpr> this.visit(ctx.index);
      } else {
        return <ExprNodes.CallExpr> this.visit(ctx.argumentList);
      }
    }

    unaryExpr(ctx): ExprNodes.Expr {
      return this.visit(ctx.primaryExpr) as PrimaryExprNode;
    }

    operand(ctx) {
      return this.visit(ctx.literal) || this.visit(ctx.operandHead);
    }

    operandHead(ctx): ExprNodes.Identifier | ExprNodes.ScopeResolver {
      if (ctx.IdentifierName) {
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
      const [name] = ctx.IdentifierName;
      const resolverSelector: { name: string, selector?: string } = { name };
      if (ctx.ResolverIdentifier) {
        const [selector] = ctx.ResolverIdentifier;
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
      const args = (ctx.baseExpr || []).map(exprNode => this.visit(exprNode));
      return {
        type: 'CallExpr',
        fun: null,
        args,
      };
    }

    json(ctx): JsonNodes.JsonNode {
      const value = ctx.object ? <JsonNodes.ObjectNode>this.visit(ctx.object) : <JsonNodes.ArrayNode> this.visit(ctx.array);
      return {
        type: 'json',
        value,
      };
    }

    array(ctx): JsonNodes.ArrayNode {
      return {
        type: 'jsonArray',
        children: ctx.jsonValue.map(valueNode => this.visit(valueNode)),
      };
    }

    object(ctx): JsonNodes.ObjectNode {
      return {
        type: 'jsonObject',
        children: (ctx.objectItem || []).map(item => this.visit(item)),
      };
    }

    objectItem(ctx): JsonNodes.PropertyNode {
      const key = JSON.parse(ctx.StringLiteral[0].image);
      const value = <JsonNodes.ValueNode> this.visit(ctx.jsonValue);
      return {
        type: 'jsonProperty',
        key,
        value,
      };
    }

    jsonValue(ctx): JsonNodes.ValueNode {
      const cstNodeType = this.$findCstNodeTypeFromContext(ctx);
      if (cstNodeType === 'object' || cstNodeType === 'array' || cstNodeType === 'stringTemplate' ) {
        return <JsonNodes.ObjectNode | JsonNodes.ArrayNode> this.visit(ctx[cstNodeType]);
      } else {
        return makeLiteralNode('jsonLiteral', ctx[cstNodeType][0]) as JsonNodes.LiteralNode;
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

    private $reduceToBinaryExpression(ctx, unaryExpr) {
      return ctx.binaryExprSide
        .map(cstNode => <ExprNodes.BinaryExpr> this.visit(cstNode))
        .reduce((leftOperator: ExprNodes.BinaryExpr, binaryExpr: ExprNodes.BinaryExpr) => {
          binaryExpr.x = leftOperator;
          return binaryExpr;
        }, unaryExpr);
    }

  }

  return AstConstructor;
}
