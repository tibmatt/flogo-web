/**
 * Based on:
 *  - https://golang.org/ref/spec
 *  - https://github.com/antlr/grammars-v4/tree/master/golang
 */

import { Lexer } from 'chevrotain';
import { UnicodeCategory } from './unicode';

// Using TypeScript we have both classes and static properties to define Tokens
export class True {
  static PATTERN = /true/;
}
export class False {
  static PATTERN = /false/;
}
export class Null {
  static PATTERN = /null/;
}
export class LCurly {
  static PATTERN = /{/;
}
export class RCurly {
  static PATTERN = /}/;
}
export class LSquare {
  static PATTERN = /\[/;
}
export class RSquare {
  static PATTERN = /]/;
}
export class Dot {
  static PATTERN = /\./;
}
export class Comma {
  static PATTERN = /,/;
}
export class Colon {
  static PATTERN = /:/;
}
export class StringLiteral {
  static PATTERN = /"(:?[^\\"\n\r]+|\\(:?[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/;
}
export class NumberLiteral {
  static PATTERN = /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/;
}
export class WhiteSpace {
  static PATTERN = /\s+/;
  static GROUP = Lexer.SKIPPED;
  static LINE_BREAKS = true;
}
// https://golang.org/ref/spec#Identifiers
// identifier = letter { letter | unicode_digit }
export class IdentifierName {
  // TODO: should we change this regex for manual parsing to avoid perf issues?
  static PATTERN = new RegExp(`[_${UnicodeCategory.Letter}][_${UnicodeCategory.Letter}${UnicodeCategory.DecimalDigit}]*`);
}
export class Lookup {
  static PATTERN = /\$/;
}
// TODO: are all operators supported?
export class UnaryOp {
  static PATTERN = /\+|-|!|\^|\*|&|<-/;
}
export class BinaryOp {
  static PATTERN = Lexer.NA;
}
// TODO: are all operators supported?
// OPERATOR PRECEDENCE: 5 (greatest)
export class MulOp {
  static PATTERN = /\*|\/|%|<<|>>|&\^|&/;
  static CATEGORIES = BinaryOp;
}
// OPERATOR PRECEDENCE: 4
// TODO: are all operators supported?
export class AddOp {
  static PATTERN = /\+|-|\|\^/;
  static CATEGORIES = BinaryOp;
}
// OPERATOR PRECEDENCE: 3
// TODO: are all operators supported?
export class RelOp {
  static PATTERN = /==|!=|<=|>=|<|>/;
  static CATEGORIES = BinaryOp;
}
// OPERATOR PRECEDENCE: 2
export class LogicalAnd {
  static PATTERN = /&&/;
  static CATEGORIES = BinaryOp;
}
// OPERATOR PRECEDENCE: 1
export class LogicalOr {
  static PATTERN = /\|\|/;
  static CATEGORIES = BinaryOp;
}
export const allTokens = [
  WhiteSpace,
  Lookup,
  NumberLiteral,
  StringLiteral,
  LCurly,
  RCurly,
  LSquare,
  RSquare,
  Dot,
  Comma,
  Colon,
  True,
  False,
  Null,
  LogicalAnd,
  MulOp,
  AddOp,
  RelOp,
  LogicalOr,
  BinaryOp,
  UnaryOp,
  IdentifierName
];
