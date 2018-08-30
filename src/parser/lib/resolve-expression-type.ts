import { parse } from './parse';
import { ExprStmt } from './ast';

const isEmptyArray = arr => !arr || arr.length <= 0;
export function resolveExpressionType(text: string): string | null {
  const result = parse(text);
  const hasErrors = !isEmptyArray(result.lexErrors) || !isEmptyArray(result.parseErrors);
  if (hasErrors || !result.ast) {
    return null;
  }

  const ast = result.ast;
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
    case 'CallExpr':
    case 'TernaryExpr':
    case 'ParenExpr':
      return 'expression';
    default:
      return 'attrAccess';
  }
}
