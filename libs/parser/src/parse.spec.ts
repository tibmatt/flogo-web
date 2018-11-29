import { LiteralNode, PropertyNode, StringTemplateNode } from './ast';
import { parse, parseResolver } from './parse';

describe('parse', function() {
  it('parses simple resolvers', function() {
    const parseResult = parseResolver(`$env[something]`);
    expect(parseResult.ast).toMatchObject({
      type: 'ScopeResolver',
      name: 'env',
      sel: 'something',
    });
  });

  it('parses object string templates', function() {
    const parseResult = parse(`{
      "simpleLiteral": "bar",
      "stringTemplate": "{{ $activity[x].y }}",
      "stringTemplateInArray": ["{{ somefunc(3) }}", "somelit", "{{ $activity[x].y }}"]
    }`);

    expect(parseResult.ast).toMatchObject({
      type: 'json',
      value: {
        type: 'jsonObject',
        children: [
          {
            type: 'jsonProperty',
            key: 'simpleLiteral',
            value: <LiteralNode>{
              type: 'jsonLiteral',
              value: 'bar',
              kind: 'string',
              raw: '"bar"',
            },
          },
          {
            type: 'jsonProperty',
            key: 'stringTemplate',
            value: <StringTemplateNode>{
              type: 'stringTemplate',
              expression: {
                type: 'SelectorExpr',
                x: {
                  type: 'ScopeResolver',
                  name: 'activity',
                  sel: 'x',
                },
                sel: <any>'y',
              },
            },
          },
          <PropertyNode>{
            type: 'jsonProperty',
            key: 'stringTemplateInArray',
            value: {
              type: 'jsonArray',
              children: [
                <StringTemplateNode>{
                  type: 'stringTemplate',
                  expression: {
                    type: 'CallExpr',
                    fun: {
                      type: 'Identifier',
                      name: 'somefunc',
                    },
                    args: [
                      {
                        type: 'BasicLit',
                        kind: 'number',
                        value: 3,
                        raw: '3',
                      },
                    ],
                  },
                },
                {
                  type: 'jsonLiteral',
                  value: 'somelit',
                  kind: 'string',
                  raw: '"somelit"',
                },
                {
                  type: 'stringTemplate',
                  expression: {
                    type: 'SelectorExpr',
                    x: {
                      type: 'ScopeResolver',
                      name: 'activity',
                      sel: 'x',
                    },
                    sel: <any>'y',
                  },
                },
              ],
            },
          },
        ],
      },
    });
  });

  it('parses ternary expressions', function() {
    const parseResult = parse('a > b ? true : false');
    expect(parseResult.ast).toBeTruthy();
    expect(parseResult.lexErrors.length).toBeFalsy();
    expect(parseResult.parseErrors.length).toBeFalsy();
    expect(parseResult.ast.type).toEqual('ExprStmt');
    expect(parseResult.ast['x'].type).toEqual('TernaryExpr');
  });

  it('parses expressions with parenthesis', function() {
    const parseResult = parse('(true)');
    expect(parseResult.ast).toBeTruthy();
    expect(parseResult.lexErrors.length).toBeFalsy();
    expect(parseResult.parseErrors.length).toBeFalsy();
    expect(parseResult.ast.type).toEqual('ExprStmt');
    expect(parseResult.ast['x'].type).toEqual('ParenExpr');
  });

  it('parses expressions with parenthesis', function() {
    const parseResult = parse('(a + 2) * 55');
    expect(parseResult.ast).toBeTruthy();
    expect(parseResult.lexErrors.length).toBeFalsy();
    expect(parseResult.parseErrors.length).toBeFalsy();
    expect(parseResult.ast.type).toEqual('ExprStmt');
    expect(parseResult.ast['x'].type).toEqual('BinaryExpr');
  });
});
