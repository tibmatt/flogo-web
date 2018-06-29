import { expect } from 'chai';
import { LiteralNode, PropertyNode, StringTemplateNode } from './ast';
import { parse, parseResolver } from './parse';

describe('parse', function () {
  it('parses simple resolvers', function() {
    const parseResult = parseResolver(`$env[something]`);
    expect(parseResult.ast).to.deep.equal({
      type: 'ScopeResolver',
      name: 'env',
      sel: 'something'
    });
  });

  it('parses object string templates', function () {
    const parseResult = parse(`{
      "simpleLiteral": "bar",
      "stringTemplate": "{{ $activity[x].y }}",
      "stringTemplateInArray": ["{{ somefunc(3) }}", "somelit", "{{ $activity[x].y }}"]
    }`);

    expect(parseResult.ast).to.deep.equal({
      type: 'json',
      value: {
        type: 'jsonObject',
        children: [
          {
            type: 'jsonProperty',
            key: 'simpleLiteral',
            value: <LiteralNode> {
              type: 'jsonLiteral', value: 'bar', kind: 'string', raw: '"bar"'
            }
          },
          {
            type: 'jsonProperty',
            key: 'stringTemplate',
            value: <StringTemplateNode> {
              type: 'stringTemplate',
              expression: {
                type: 'SelectorExpr',
                x: {
                  type: 'ScopeResolver',
                  name: 'activity',
                  sel: 'x'
                },
                sel: <any> 'y'
              }
            }
          },
          <PropertyNode> {
            'type': 'jsonProperty',
            'key': 'stringTemplateInArray',
            'value': {
              'type': 'jsonArray',
              'children': [
                <StringTemplateNode> {
                  type: 'stringTemplate',
                  expression: {
                    type: 'CallExpr',
                    fun: {
                      type: 'Identifier',
                      name: 'somefunc'
                    },
                    args: [
                      {
                        type: 'BasicLit',
                        kind: 'number',
                        value: 3,
                        raw: '3'
                      }
                    ]
                  }
                },
                {
                  type: 'jsonLiteral', value: 'somelit', kind: 'string', raw: '"somelit"'
                },
                {
                  type: 'stringTemplate',
                  expression: {
                    type: 'SelectorExpr',
                    x: {
                      type: 'ScopeResolver',
                      name: 'activity',
                      sel: 'x'
                    },
                    sel: <any> 'y'
                  }
                }
              ]
            }
          }
        ],
      }
    });
  });
});

