import { normalizeContribUrl } from './url-parser';

const assertParsedEquals = (url, expected) => expect(normalizeContribUrl(url)).toEqual(expected, `Incorrect parse for ${url}`);

describe('parse', () => {
  it('should parse url', function () {
    assertParsedEquals('github.com/TIBCOSoftware/flogo-contrib/activity/rest', 'github.com/TIBCOSoftware/flogo-contrib/activity/rest');
    assertParsedEquals('github.com/TIBCOSoftware/flogo-contrib/tree/master/activity/rest', 'github.com/TIBCOSoftware/flogo-contrib/activity/rest');
    assertParsedEquals('https://github.com/TIBCOSoftware/rootrepo', 'github.com/TIBCOSoftware/rootrepo');
    assertParsedEquals('https://some.other.url/a/b', 'some.other.url/a/b');
    assertParsedEquals('some.other.url/a/b', 'some.other.url/a/b');
    assertParsedEquals('https://some.other.url/tree/master/a/b', 'some.other.url/tree/master/a/b');
  });
});
