/**
 * Mapping expressions parser
 * Based on:
 *  - https://golang.org/ref/spec
 *  - https://github.com/antlr/grammars-v4/tree/master/golang
 */
import { IToken, Lexer, Parser, tokenMatcher } from 'chevrotain';
import { UnicodeCategory } from './unicode';

/////////////////////////////
//        TOKENS           //
////////////////////////////

// IMPORTANT:  Tokens are defined in the same file to prevent webpack/treeshaking from removing them
// as it cannot detect the tokens are being used by the parser.
// Another alternative would be to 'require' the file which will also prevent treeshaking but 'require' is causing issues
// with the current setup.
// const Token = require('./tokens');

export class True {
  static LABEL = 'true';
  static PATTERN = /true/;
}

export class False {
  static LABEL = 'false';
  static PATTERN = /false/;
}

export class Null {
  static LABEL = 'null';
  static PATTERN = /null/;
}

export class LCurly {
  static LABEL = '{';
  static PATTERN = /{/;
}

export class RCurly {
  static LABEL = '}';
  static PATTERN = /}/;
}

export class LSquare {
  static LABEL = '[';
  static PATTERN = /\[/;
}

export class RSquare {
  static LABEL = ']';
  static PATTERN = /]/;
}

export class Dot {
  static LABEL = '.';
  static PATTERN = /\./;
}

export class Comma {
  static LABEL = ',';
  static PATTERN = /,/;
}

export class Colon {
  static LABEL = ':';
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
  static LABEL = '$';
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
const Token = {
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
  IdentifierName,
  allTokens,
};

/////////////////////////////
//        PARSER           //
////////////////////////////

// disable member odering rule because the parser requires to declare properties
// instead of functions, so all the functions are properties
// tslint:disable:member-ordering
export class MappingParser extends Parser {

  constructor(input: IToken[]) {
    super(input, Token.allTokens, {
      recoveryEnabled: true,
      outputCst: true,
    });
    Parser.performSelfAnalysis(this);
  }

  public mappingExpression = this.RULE('mappingExpression', () => {
    this.OR([
      {ALT: () => this.SUBRULE(this.expression)},
      {ALT: () => this.SUBRULE(this.json)}
    ]);
  });

  public programNoExpression = this.RULE('programNoExpression', () => {
    this.OR([
      {
        ALT: () => this.SUBRULE(this.attrAccess)
      },
      {
        ALT: () => this.SUBRULE(this.literal)
      },
      {
        ALT: () => this.SUBRULE(this.json)
      }
    ]);
  });

  public attrAccess = this.RULE('attrAccess', () => {
    this.SUBRULE(this.operandHead);
    this.MANY(() => this.SUBRULE(this.primaryExprTail));
  });

  public literal = this.RULE('literal', () => {
    this.OR([
      {ALT: () => this.CONSUME(Token.StringLiteral)},
      {ALT: () => this.CONSUME(Token.NumberLiteral)},
      {ALT: () => this.CONSUME(Token.True)},
      {ALT: () => this.CONSUME(Token.False)},
      {ALT: () => this.CONSUME(Token.Null)}
    ]);
  });

  public json = this.RULE('json', () => {
    this.OR([
      {ALT: () => this.SUBRULE(this.object)},
      {ALT: () => this.SUBRULE(this.array)}
    ]);
  });

  public expression = this.RULE('expression', () => {
    this.SUBRULE(this.unaryExpr);
    this.MANY(() => this.SUBRULE1(this.binaryExprSide));
  });

  private binaryExprSide = this.RULE('binaryExprSide', () => {
    this.CONSUME(Token.BinaryOp);
    this.SUBRULE(this.expression);
  });

  private unaryExpr = this.RULE('unaryExpr', () => {
    this.OR([
      {
        ALT: () => this.SUBRULE(this.primaryExpr)
      },
      {
        ALT: () => this.SUBRULE(this.unaryExprOperation)
      }
    ]);
  });

  private unaryExprOperation = this.RULE('unaryExprOperation', () => {
    this.CONSUME(Token.UnaryOp);
    this.SUBRULE(this.unaryExpr);
  });

  private primaryExpr = this.RULE('primaryExpr', () => {
    this.SUBRULE(this.operand);
    this.MANY(() => this.SUBRULE1(this.primaryExprTail));
  });

  private primaryExprTail = this.RULE('primaryExprTail', () => {
    this.OR([
      {ALT: () => this.SUBRULE(this.selector)},
      {ALT: () => this.SUBRULE(this.index)}
    ]);
  });

  // todo: parenthesis support
  private operand = this.RULE('operand', () => {
    this.OR([
      {ALT: () => this.SUBRULE(this.literal)},
      {ALT: () => this.SUBRULE(this.operandHead)}
    ]);
  });

  private operandHead = this.RULE('operandHead', () => {
    this.OR([
      {ALT: () => this.CONSUME(Token.IdentifierName)},
      {ALT: () => this.SUBRULE(this.resolver)},
    ]);
  });

  private resolver = this.RULE('resolver', () => {
    this.CONSUME1(Token.Lookup);
    this.CONSUME2(Token.IdentifierName);
    this.OPTION({
      // avoid ambiguity between $resolver[name] and $arrayThing[0]
      GATE: () => !tokenMatcher(this.LA(2), Token.NumberLiteral),
      DEF: () => this.SUBRULE(this.resolverSelector),
    });
  });

  private resolverSelector = this.RULE('resolverSelector', () => {
    // this.CONSUME(Token.IdentifierName);
    this.CONSUME(Token.LSquare);
    this.CONSUME2(Token.IdentifierName);
    this.CONSUME(Token.RSquare);
  });

  private selector = this.RULE('selector', () => {
    this.CONSUME(Token.Dot);
    this.CONSUME(Token.IdentifierName);
  });

  //// JSON

  private index = this.RULE('index', () => {
    this.CONSUME(Token.LSquare);
    this.CONSUME(Token.NumberLiteral);
    this.CONSUME(Token.RSquare);
  });

  private object = this.RULE('object', () => {
    this.CONSUME(Token.LCurly);
    this.MANY_SEP({
      SEP: Token.Comma,
      DEF: () => {
        this.SUBRULE(this.objectItem);
      }
    });
    this.CONSUME(Token.RCurly);
  });

  private objectItem = this.RULE('objectItem', () => {
    this.CONSUME(Token.StringLiteral);
    this.CONSUME(Token.Colon);
    this.SUBRULE(this.value);
  });

  private array = this.RULE('array', () => {
    this.CONSUME(Token.LSquare);
    this.MANY_SEP({
      SEP: Token.Comma,
      DEF: () => {
        this.SUBRULE(this.value);
      }
    });
    this.CONSUME(Token.RSquare);
  });

  private value = this.RULE('value', () => {
    this.OR([
      {ALT: () => this.CONSUME(Token.StringLiteral)},
      {ALT: () => this.CONSUME(Token.NumberLiteral)},
      {ALT: () => this.SUBRULE(this.object)},
      {ALT: () => this.SUBRULE(this.array)},
      {ALT: () => this.CONSUME(Token.True)},
      {ALT: () => this.CONSUME(Token.False)},
      {ALT: () => this.CONSUME(Token.Null)}
    ]);
  });

}
