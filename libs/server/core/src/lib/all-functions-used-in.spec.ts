import { allFunctionsUsedIn } from './all-functions-used-in';

describe('server.core.lib.allFunctionsUsedIn', () => {
  it('Should return empty array when no expression is used', () => {
    expect(
      allFunctionsUsedIn({
        test: 'testing',
      })
    ).toEqual([]);
  });

  it('Should not break the logic', () => {
    expect(
      allFunctionsUsedIn({
        test: false,
        test1: 'testing',
        test2: 232143,
        test3: '=sdafasdf',
      })
    ).toEqual([]);
  });

  it('Should give the proper list of functions used in the mappings', () => {
    expect(
      allFunctionsUsedIn({
        test: '=string.concat("dummy", "value")',
        test1:
          '={"testKey": "{{ string.equal() }}", "testKey2": "{{ string.concat() }}" }',
      })
    ).toEqual(['string.concat', 'string.equal']);
  });

  it('Should return unique set of functions', () => {
    expect(
      allFunctionsUsedIn({
        test: '=string.concat("dummy", "value")',
        test1: '=string.concat("hello", "world")',
      })
    ).toEqual(['string.concat']);
  });
});
