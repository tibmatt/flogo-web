import { parse } from './parse';
import { LiteralNode, PropertyNode, StringTemplateNode } from './ast/index';

describe('parse', function () {
  it('parses object string templates', function () {
    const parseResult = parse(`{
      "simpleLiteral": "bar",
      "stringTemplate": "{{ $activity[x].y }}",
      "stringTemplateInArray": ["{{ somefunc(3) }}", "somelit", "{{ $activity[x].y }}"]
    }`);

    expect(parseResult.ast).toEqual({
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
