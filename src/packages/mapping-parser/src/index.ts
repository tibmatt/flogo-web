import { Lexer, ILexingError, exceptions, CstElement, CstNode } from 'chevrotain';
import { allTokens } from './tokens';
import { MappingParser } from './parser';
import { astCreatorFactory } from './ast/ast-creator';
import { Node } from './ast/node';
import { ExprStmt } from './ast/expr-nodes';

export interface ParseResult {
  cst: CstElement;
  ast: Node,
  lexErrors: ILexingError[];
  parseErrors: exceptions.IRecognitionException[];
}

const lexer = new Lexer(allTokens);
// reuse the same parser instance.
const parserInstance = new MappingParser([]);
const BaseCstVisitor = parserInstance.getBaseCstVisitorConstructor();
// const BaseCstVisitor = parserInstance.getBaseCstVisitorConstructorWithDefaults();
const AstCreator = astCreatorFactory(BaseCstVisitor);

export function parse(text): ParseResult {
  let lexResult = lexer.tokenize(text)
  // setting a new input will RESET the parser instance's state.
  parserInstance.input = lexResult.tokens;
  // todo: for clarity change for parserInstance.program() once this generic function is not needed
  const cst = parserInstance.mappingExpression();
  let ast = null;
  if (parserInstance.errors.length === 0) {
    const astCreator = new AstCreator();
    ast = astCreator.visit(cst);
  }
  return {
      cst,
      ast,
      lexErrors: lexResult.errors,
      parseErrors: parserInstance.errors
  };
}

export function determineMappingExpressionType(text: string): string | null {
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

function getTypeFromParseResult(parseResult: ParseResult) {
  const programCst = parseResult.cst;
  const hasErrors = !isArrayEmpty(parseResult.lexErrors) || !isArrayEmpty(parseResult.parseErrors);
  if (hasErrors || !isCstNode(programCst)) {
    return null;
  }
  const children = programCst.children;
  const type = Object.keys(children).find(nodeType => children[nodeType].length > 0);
  const child = <CstNode> children[type][0];
  // todo: we already checked for errors so this condition might be redundant
  if (!child.recoveredNode) {
    return type;
  } else {
    return null;
  }
}

function isArrayEmpty(array: Array<any>) {
  return !array || array.length <= 0;
}

function isCstNode(element: CstElement): element is CstNode {
  return element && (<CstNode>element).children !== undefined;
}
