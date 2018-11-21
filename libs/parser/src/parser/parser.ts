/**
 * Mapping expressions parser
 * Based on:
 *  - https://golang.org/ref/spec
 *  - https://github.com/antlr/grammars-v4/tree/master/golang
 */
import { IToken, TokenType, Lexer, Parser, tokenMatcher, createToken, IMultiModeLexerDefinition, TokenVocabulary } from 'chevrotain';
import { Identifier } from '../ast/expr-nodes';
import { UnicodeCategory } from './unicode';

/////////////////////////////
//        TOKENS           //
////////////////////////////

// IMPORTANT:  Tokens are defined in the same file to prevent webpack/treeshaking from removing them
// as it cannot detect the tokens are being used by the parser.
// Another alternative would be to 'require' the file which will also prevent treeshaking but 'require' is causing issues
// with the current setup.
// const Token = require('./tokens');

// https://golang.org/ref/spec#Identifiers
// identifier = letter { letter | unicode_digit }
const IdentifierName = createToken({
  name: 'IdentifierName',
  label: 'Identifier',
  // TODO: should we change this regex for manual parsing to avoid perf issues?
  pattern: new RegExp(`[_${UnicodeCategory.Letter}][_${UnicodeCategory.Letter}${UnicodeCategory.DecimalDigit}]*`),
});

const True = createToken({
  name: 'True',
  label: 'true',
  pattern: /true/,
});

const False = createToken({
  name: 'False',
  label: 'false',
  pattern: /false/,
});

const Nullable = createToken({
  name: 'Nullable',
  label: 'Nullable',
  pattern: Lexer.NA,
});

const Null = createToken({
  name: 'Null',
  label: 'null',
  longer_alt: IdentifierName,
  categories: Nullable,
  pattern: /null/,
});

const Nil = createToken({
  name: 'Nil',
  label: 'nil',
  longer_alt: IdentifierName,
  categories: Nullable,
  pattern: /nil/,
});

const LCurly = createToken({
  name: 'LCurly',
  label: '{',
  pattern: /{/,
});

const RCurly = createToken({
  name: 'RCurly',
  label: '}',
  pattern: /}/,
});

const LParen = createToken({
  name: 'LParen',
  label: '(',
  pattern: /\(/,
});

const RParen = createToken({
  name: 'RParen',
  label: ')',
  pattern: /\)/,
});

const LSquare = createToken({
  name: 'LSquare',
  label: '[',
  pattern: /\[/,
});

const RSquare = createToken({
  name: 'RSquare',
  label: ']',
  pattern: /]/,
});

const Dot = createToken({
  name: 'Dot',
  label: '.',
  pattern: /\./,
});

const Comma = createToken({
  name: 'Comma',
  label: ',',
  pattern: /,/,
});

const TernaryOper = createToken({
  name: 'TernaryOper',
  label: '?',
  pattern: /\?/,
});

const Colon = createToken({
  name: 'Colon',
  label: ':',
  pattern: /:/,
});

const StringLiteral = createToken({
  name: 'StringLiteral',
  label: 'StringLiteral',
  pattern: Lexer.NA,
});

const DblQuoteStringLiteral = createToken({
  name: 'DblQuoteStringLiteral',
  label: 'StringLiteral',
  categories: StringLiteral,
  pattern: /"(?:[^\\"]|\\(?:[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/,
});

const SingleQuoteStringLiteral = createToken({
  name: 'SingleQuoteStringLiteral',
  label: 'StringLiteral',
  categories: StringLiteral,
  pattern: /'(?:[^\\']|\\(?:[bfnrtv'\\/]|u[0-9a-fA-F]{4}))*'/,
});

const NestedDblQuoteStringLiteral = createToken({
  name: 'NestedDblQuoteStringLiteral',
  label: 'StringLiteral',
  categories: StringLiteral,
  pattern: /\\"(?:[^\\\\"]|\\\\(?:[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*\\"/,
});

function matchStringTemplateOpen(text: string, startOffset?: number, tokens?: IToken[]) {
  if (tokens.length <= 2) {
    return null;
  }
  const isLexingJson = tokens.find((token, index, tokenArr) => {
    const prevToken = index - 1 >= 0 ? tokenArr[index - 1] : null;
    return prevToken && tokenMatcher(token, Colon) && tokenMatcher(prevToken, StringLiteral);
  });
  if (!isLexingJson) {
    return null;
  }
  return /^"{{/.exec(text.substr(startOffset));
}

const StringTemplateOpen = createToken({
  name: 'StringTemplateOpen',
  label: 'Open String template ("{{)',
  pattern: { exec: matchStringTemplateOpen },
  line_breaks: false,
  push_mode: 'string_template'
});

const StringTemplateClose = createToken({
  name: 'StringTemplateClose',
  label: 'Closing StringTemplate (}}")',
  pattern: /}}"/,
  pop_mode: true,
});

const NumberLiteral = createToken({
  name: 'NumberLiteral',
  label: 'NumberLiteral',
  pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/,
});

const WhiteSpace = createToken({
  name: 'WhiteSpace',
  label: 'Whitespace',
  pattern: /\s+/,
  group: Lexer.SKIPPED,
  line_breaks: true,
});

const Lookup = createToken({
  name: 'Lookup',
  label: '$',
  pattern: /\$/,
});

const RESOLVER_PATTERN = new RegExp(`[_${UnicodeCategory.Letter}][_\.${UnicodeCategory.Letter}${UnicodeCategory.DecimalDigit}]*`);
function matchResolverIdentifier(text: string, startOffset?: number, tokens?: IToken[]) {
  if (tokens.length < 3) {
    return null;
  }
  const lastTokenIdx = tokens.length - 1;
  const isLexingResolver = tokenMatcher(tokens[lastTokenIdx], LSquare)
    && tokenMatcher(tokens[lastTokenIdx - 1], IdentifierName)
    &&  tokenMatcher(tokens[lastTokenIdx - 2], Lookup);
  if (isLexingResolver) {
    return RESOLVER_PATTERN.exec(text.substr(startOffset));
  }
  return null;
}

const ResolverIdentifier = createToken({
  name: 'ResolverIdentifier',
  label: 'ResolverIdentifier',
  pattern: { exec: matchResolverIdentifier },
  line_breaks: false,
});

const BinaryOp = createToken({
  name: 'BinaryOp',
  label: 'Binary operator',
  pattern: Lexer.NA,
});

// TODO: are all operators supported?
// OPERATOR PRECEDENCE: 5 (greatest)
const MulOp = createToken({
  name: 'MulOp',
  pattern: /\*|\/|%|<<|>>|&/,
  categories: BinaryOp,
});

// OPERATOR PRECEDENCE: 4
// TODO: are all operators supported?
const AddOp = createToken({
  name: 'AddOp',
  pattern: /[+\-]/,
  categories: BinaryOp,
});

// OPERATOR PRECEDENCE: 3
// TODO: are all operators supported?
const RelOp = createToken({
  name: 'RelOp',
  pattern: /==|!=|<=|>=|<|>/,
  categories: BinaryOp,
});

// OPERATOR PRECEDENCE: 2
const LogicalAnd = createToken({
  name: 'LogicalAnd',
  pattern: /&&/,
  categories: BinaryOp,
});

// OPERATOR PRECEDENCE: 1
const LogicalOr = createToken({
  name: 'LogicalOr',
  pattern: /\|\|/,
  categories: BinaryOp,
});

export const Token = {
  WhiteSpace,
  Lookup,
  NumberLiteral,
  StringLiteral,
  DblQuoteStringLiteral,
  NestedDblQuoteStringLiteral,
  SingleQuoteStringLiteral,
  StringTemplateOpen,
  StringTemplateClose,
  LParen,
  RParen,
  LCurly,
  RCurly,
  LSquare,
  RSquare,
  TernaryOper,
  Dot,
  Comma,
  Colon,
  True,
  False,
  Nullable,
  Null,
  Nil,
  LogicalAnd,
  MulOp,
  AddOp,
  RelOp,
  LogicalOr,
  BinaryOp,
  ResolverIdentifier,
  IdentifierName,
};

export const lexerDefinition: IMultiModeLexerDefinition = {
  modes: {
    default: [
      WhiteSpace,
      Lookup,
      NumberLiteral,
      StringTemplateOpen,
      StringLiteral,
      DblQuoteStringLiteral,
      SingleQuoteStringLiteral,
      LParen,
      RParen,
      LCurly,
      RCurly,
      LSquare,
      RSquare,
      TernaryOper,
      Dot,
      Comma,
      Colon,
      True,
      False,
      Null,
      Nil,
      Nullable,
      LogicalAnd,
      MulOp,
      AddOp,
      RelOp,
      LogicalOr,
      BinaryOp,
      ResolverIdentifier,
      IdentifierName,
    ],
    string_template: [
      WhiteSpace,
      Lookup,
      NumberLiteral,
      StringLiteral,
      NestedDblQuoteStringLiteral,
      SingleQuoteStringLiteral,
      StringTemplateClose,
      LParen,
      RParen,
      LSquare,
      RSquare,
      TernaryOper,
      Dot,
      Comma,
      Colon,
      True,
      False,
      Nil,
      Null,
      Nullable,
      LogicalAnd,
      MulOp,
      AddOp,
      RelOp,
      LogicalOr,
      BinaryOp,
      ResolverIdentifier,
      IdentifierName,
    ],
  },
  defaultMode: 'default',
};

export const allTokens: TokenType[] = [...Object.values(Token)];

/////////////////////////////
//        PARSER           //
////////////////////////////

// disable member odering rule because the parser requires to declare properties
// instead of functions, so all the functions are properties
// tslint:disable:member-ordering
export class MappingParser extends Parser {

  constructor(input: IToken[]) {
    super(input, lexerDefinition, {
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
      {ALT: () => this.CONSUME(Token.Nullable)}
    ]);
  });

  public json = this.RULE('json', () => {
    this.OR([
      {ALT: () => this.SUBRULE(this.object)},
      {ALT: () => this.SUBRULE(this.array)}
    ]);
  });

  public expression = this.RULE('expression', () => {
    this.SUBRULE(this.baseExpr);
    this.OPTION(() => this.SUBRULE(this.ternaryExpr));
  });

  public baseExpr = this.RULE('baseExpr', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.parenExpr) },
      { ALT: () => this.SUBRULE(this.unaryExpr) }
    ]);
    this.MANY(() => this.SUBRULE1(this.binaryExprSide));
  });

  private parenExpr = this.RULE('parenExpr', () => {
    this.CONSUME(Token.LParen);
    this.SUBRULE(this.baseExpr);
    this.CONSUME(Token.RParen);
  });

  public resolver = this.RULE('resolver', () => {
    this.CONSUME1(Token.Lookup);
    this.OPTION(() => this.SUBRULE(this.resolverSelector));
  });

  private binaryExprSide = this.RULE('binaryExprSide', () => {
    this.CONSUME(Token.BinaryOp);
    this.SUBRULE(this.baseExpr);
  });

  private unaryExpr = this.RULE('unaryExpr', () => {
    return this.SUBRULE(this.primaryExpr);
  });

  private primaryExpr = this.RULE('primaryExpr', () => {
    this.SUBRULE(this.operand);
    this.MANY(() => this.SUBRULE1(this.primaryExprTail));
  });

  private primaryExprTail = this.RULE('primaryExprTail', () => {
    this.OR([
      {ALT: () => this.SUBRULE(this.selector)},
      {ALT: () => this.SUBRULE(this.index)},
      {ALT: () => this.SUBRULE(this.argumentList)}
    ]);
  });

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

  private resolverSelector = this.RULE('resolverSelector', () => {
    this.CONSUME1(Token.IdentifierName);
    this.OPTION({
      // avoid ambiguity between $resolver[name] and $arrayThing[0]
      GATE: () => !tokenMatcher(this.LA(2), Token.NumberLiteral),
      DEF: () => {
        this.CONSUME(Token.LSquare);
        this.CONSUME(Token.ResolverIdentifier);
        this.CONSUME(Token.RSquare);
      },
    });
  });

  protected selector = this.RULE('selector', () => {
    this.CONSUME(Token.Dot);
    this.CONSUME(Token.IdentifierName);
  });

  protected index = this.RULE('index', () => {
    this.CONSUME(Token.LSquare);
    this.CONSUME(Token.NumberLiteral);
    this.CONSUME(Token.RSquare);
  });

  protected argumentList = this.RULE('argumentList', () => {
    this.CONSUME(Token.LParen);
    this.MANY_SEP({
      SEP: Token.Comma,
      DEF: () => this.SUBRULE(this.baseExpr),
    });
    this.CONSUME(Token.RParen);
  });

  protected ternaryExpr = this.RULE('ternaryExpr', () => {
    this.CONSUME1(Token.TernaryOper);
    this.SUBRULE1(this.baseExpr);
    this.CONSUME2(Token.Colon);
    this.SUBRULE2(this.baseExpr);
  });

  //// JSON

  protected object = this.RULE('object', () => {
    this.CONSUME(Token.LCurly);
    this.MANY_SEP({
      SEP: Token.Comma,
      DEF: () => {
        this.SUBRULE(this.objectItem);
      }
    });
    this.CONSUME(Token.RCurly);
  });

  protected objectItem = this.RULE('objectItem', () => {
    this.CONSUME(Token.StringLiteral);
    this.CONSUME(Token.Colon);
    this.SUBRULE(this.jsonValue);
  });

  protected array = this.RULE('array', () => {
    this.CONSUME(Token.LSquare);
    this.MANY_SEP({
      SEP: Token.Comma,
      DEF: () => {
        this.SUBRULE(this.jsonValue);
      }
    });
    this.CONSUME(Token.RSquare);
  });

  protected jsonValue = this.RULE('jsonValue', () => {
    this.OR([
      {ALT: () => this.SUBRULE(this.stringTemplate)},
      {ALT: () => this.CONSUME(Token.DblQuoteStringLiteral)},
      {ALT: () => this.CONSUME(Token.NumberLiteral)},
      {ALT: () => this.SUBRULE(this.object)},
      {ALT: () => this.SUBRULE(this.array)},
      {ALT: () => this.CONSUME(Token.True)},
      {ALT: () => this.CONSUME(Token.False)},
      {ALT: () => this.CONSUME(Token.Null)}
    ]);
  });

  protected stringTemplate = this.RULE('stringTemplate', () => {
    this.CONSUME(Token.StringTemplateOpen);
    this.SUBRULE(this.expression);
    this.CONSUME(Token.StringTemplateClose);
  });

}
