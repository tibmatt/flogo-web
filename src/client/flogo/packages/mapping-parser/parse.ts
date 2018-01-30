import { Lexer } from 'chevrotain';
import { allTokens, MappingParser } from './parser/parser';
import { astCreatorFactory } from './ast/ast-creator';
import { ParseResult } from './parser/parse-result';

const lexer = new Lexer(<any>allTokens);
// reuse the same parser instance.
const parserInstance = new MappingParser([]);
const BaseCstVisitor = parserInstance.getBaseCstVisitorConstructor();
// const BaseCstVisitor = parserInstance.getBaseCstVisitorConstructorWithDefaults();
const AstCreator = astCreatorFactory(BaseCstVisitor);

export function parse(text): ParseResult {
  const lexResult = lexer.tokenize(text);
  // setting a new input will RESET the parser instance's state.
  parserInstance.input = lexResult.tokens;
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
