import { parse } from './parse';
import { ExprStmt } from './ast/expr-nodes';

export function resolveExpressionType(text: string): string | null {
  const ast = parse(text).ast;
  if (!ast) {
    return null;
  }

  if (ast.type === 'json') {
    return 'json';
  } else {
    const exprStmt = (<ExprStmt>ast).x;
    return translateExprStmtType(exprStmt.type);
  }
}

function translateExprStmtType(exprStmtType: string) {
  switch (exprStmtType) {
    case 'BasicLit':
      return 'literal';
    case 'UnaryExpr':
    case 'BinaryExpr':
      return 'expression';
    default:
      return 'attrAccess';
  }
}
