import { Parser, IToken, tokenMatcher } from 'chevrotain';
// IMPORTANT: use require to prevent webpack/treeshaking from removing the tokens
// as it cannot detect the tokens are being used by the parser.
const Token = require('./tokens');

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
      { ALT: () => this.SUBRULE(this.expression) },
      { ALT: () => this.SUBRULE(this.json) }
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
      { ALT: () => this.CONSUME(Token.StringLiteral) },
      { ALT: () => this.CONSUME(Token.NumberLiteral) },
      { ALT: () => this.CONSUME(Token.True) },
      { ALT: () => this.CONSUME(Token.False) },
      { ALT: () => this.CONSUME(Token.Null) }
    ]);
  });

  public json = this.RULE('json', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.object) },
      { ALT: () => this.SUBRULE(this.array) }
    ]);
  });

  public expression = this.RULE('expression', () => {
    this.SUBRULE(this.unaryExpr);
    this.MANY(() => this.SUBRULE1(this.binaryExprSide));
  });

  private binaryExprSide = this.RULE('binaryExprSide', () => {
    this.CONSUME(Token.BinaryOp);
    this.SUBRULE(this.expression);
  })

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
      { ALT: () => this.SUBRULE(this.selector) },
      { ALT: () => this.SUBRULE(this.index) }
    ])
  });

  // todo: parenthesis support
  private operand = this.RULE('operand', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.literal) },
      { ALT: () => this.SUBRULE(this.operandHead) }
    ]);
  });

  private operandHead = this.RULE('operandHead', () => {
    this.OR([
      { ALT: () => this.CONSUME(Token.IdentifierName) },
      { ALT: () => this.SUBRULE(this.resolver) },
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
      { ALT: () => this.CONSUME(Token.StringLiteral) },
      { ALT: () => this.CONSUME(Token.NumberLiteral) },
      { ALT: () => this.SUBRULE(this.object) },
      { ALT: () => this.SUBRULE(this.array) },
      { ALT: () => this.CONSUME(Token.True) },
      { ALT: () => this.CONSUME(Token.False) },
      { ALT: () => this.CONSUME(Token.Null) }
    ]);
  });
}
