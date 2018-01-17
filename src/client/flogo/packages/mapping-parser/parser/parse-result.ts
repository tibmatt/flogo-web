import { CstElement, exceptions, ILexingError } from 'chevrotain';
import { Node } from '../ast/node';

export type RecognitionException = exceptions.IRecognitionException;
export type LexingError = ILexingError;

export interface ParseResult {
  cst: CstElement;
  ast: Node;
  lexErrors: LexingError[];
  parseErrors: RecognitionException[];
}
