import { CstElement, exceptions, ILexingError } from 'chevrotain';
import { ExprStmt, JsonNode } from '../ast/index';

export type RecognitionException = exceptions.IRecognitionException;
export type LexingError = ILexingError;

export interface ParseResult {
  cst: CstElement;
  ast: ExprStmt | JsonNode;
  lexErrors: LexingError[];
  parseErrors: RecognitionException[];
}
