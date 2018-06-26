import { CstElement, IRecognitionException, ILexingError } from 'chevrotain';
import { Node } from '../ast';

export type RecognitionException = IRecognitionException;
export type LexingError = ILexingError;

export interface ParseResult {
  cst: CstElement;
  ast: Node;
  lexErrors: LexingError[];
  parseErrors: RecognitionException[];
}
