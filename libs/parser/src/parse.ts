import { Lexer } from 'chevrotain';
import { lexerDefinition, MappingParser } from './parser/parser';
import { astCreatorFactory } from './ast/ast-creator';
import { ParseResult } from './parser/parse-result';

const lexer = new Lexer(lexerDefinition);
// reuse the same parser instance.
const parserInstance = new MappingParser([]);
const BaseCstVisitor = parserInstance.getBaseCstVisitorConstructor();
// const BaseCstVisitor = parserInstance.getBaseCstVisitorConstructorWithDefaults();
const AstCreator = astCreatorFactory(BaseCstVisitor);

export type StartingRuleName = 'mappingExpression' | 'resolver';
export function parse(text, startingRule: StartingRuleName = 'mappingExpression'): ParseResult {
  const lexResult = lexer.tokenize(text);
  // setting a new input will RESET the parser instance's state.
  parserInstance.input = lexResult.tokens;
  const cst = parserInstance[startingRule]();
  let ast = null;
  if (parserInstance.errors.length === 0) {
    const astCreator = new AstCreator();
    ast = astCreator.visit(cst);
  }
  return {
    cst,
    ast,
    lexErrors: lexResult.errors,
    parseErrors: parserInstance.errors,
  };
}

export function parseResolver(text) {
  return parse(text, 'resolver');
}
