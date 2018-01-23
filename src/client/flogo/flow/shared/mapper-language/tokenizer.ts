export function load() {
  return {
    keywords: [
      'true', 'false', 'null'
    ],

    builtins: [
      'undefined'
    ],

    operators: [
      '=', '>', '<', '!', '~', '?', ':',
      '==', '<=', '>=', '!=', '&&', '||', '++', '--',
      '+', '-', '*', '/', '&', '|', '^', '%', '<<',
      '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
      '^=', '%=', '<<=', '>>=', '>>>='
    ],

    // define our own brackets as '<' and '>' do not match in javascript
    brackets: [
      ['(', ')', 'bracket.parenthesis'],
      ['{', '}', 'bracket.curly'],
      ['[', ']', 'bracket.square']
    ],

    // common regular expressions
    symbols: /[~!@#%\^&*-+=|\\:`<>.?\/]+/,
    escapes: /\\(?:[btnfr\\"']|[0-7][0-7]?|[0-3][0-7]{2})/,
    exponent: /[eE][\-+]?[0-9]+/,

    tokenizer: {
      root: [
        // identifiers and keywords
        [/([a-zA-Z_][\w\$]*)(\s*)(:?)/, {
          cases: {
            '$1@keywords': ['keyword', 'white', 'delimiter'],
            '$3': ['key.identifier', 'white', 'delimiter'],   // followed by :
            '$1@builtins': ['predefined.identifier', 'white', 'delimiter'],
            '@default': ['identifier', 'white', 'delimiter']
          }
        }],

        [/\$[\w\$]*/, 'type.identifier'],  // to show class names nicely

        // whitespace
        {include: '@whitespace'},

        // delimiters and operators
        [/[{}()\[\]]/, '@brackets'],
        [/[;,.]/, 'delimiter'],
        [/@symbols/, {
          cases: {
            '@operators': 'operator',
            '@default': ''
          }
        }],

        // numbers
        [/\d+\.\d*(@exponent)?/, 'number.float'],
        [/\.\d+(@exponent)?/, 'number.float'],
        [/\d+@exponent/, 'number.float'],
        [/0[xX][\da-fA-F]+/, 'number.hex'],
        [/0[0-7]+/, 'number.octal'],
        [/\d+/, 'number'],

        // strings: recover on non-terminated strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
        [/'([^'\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
        [/"/, 'string', '@string."'],
        [/'/, 'string', '@string.\''],
      ],

      whitespace: [
        [/[ \t\r\n]+/, 'white'],
      ],

      string: [
        [/[^\\"']+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/["']/, {
          cases: {
            '$#==$S2': {token: 'string', next: '@pop'},
            '@default': 'string'
          }
        }]
      ]
    },
  };
}
