import { parseAndExtractReferences } from './functions';

describe('functions:extract-references', () => {
  describe('extracts functions in expressions', () => {
    it('in simple functions', () => {
      expect(parseAndExtractReferences('string.concat(a, b)')).toEqual(['string.concat']);
    });

    it('in non namespaced functions', function() {
      expect(parseAndExtractReferences('someFunc()')).toEqual(['someFunc']);
    });

    it('in nested functions', function() {
      expect(
        parseAndExtractReferences(
          'root.level.func($activity[a].b, nested.function(with.another()))'
        )
      ).toEqual(['root.level.func', 'nested.function', 'with.another']);
    });

    it('in operations', function() {
      expect(
        parseAndExtractReferences('repeated.func() + repeated.func() + somevar')
      ).toEqual(['repeated.func']);
    });

    it('in boolean expressions', () => {
      expect(
        parseAndExtractReferences('repeated.func() + repeated.func() + somevar')
      ).toEqual(['repeated.func']);
      expect(parseAndExtractReferences('left() >= x.right()')).toEqual([
        'left',
        'x.right',
      ]);
    });
  });

  it('extracts functions in objects', () => {
    expect(
      parseAndExtractReferences(`{
       "prop":"{{ string.concat(template.usage(), \\"foo\\") }}",
       "object":{
          "nested":"{{ number.random() }}"
       }
      }`)
    ).toEqual(['string.concat', 'template.usage', 'number.random']);
  });
});
