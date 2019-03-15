import { RefAgent } from './ref-agent';
import { FunctionRefFinder } from './function-ref-finder';

describe('ref agent', () => {
  let refAgent: RefAgent;
  const functionsReverseLookupStub: Partial<FunctionRefFinder> = {
    findPackage(functionName: string) {
      if (functionName === 'used.function') {
        return 'github.com/some-package-with-functions/ref';
      }
    },
  };

  beforeEach(() => {
    refAgent = new RefAgent(functionsReverseLookupStub as FunctionRefFinder);
  });

  test('it returns the type from a ref', () => {
    expect(
      refAgent.registerRef('github.com/project-flogo/contrib/activity/rest')
    ).toEqual('#rest');
  });

  test('it returns the same type for the same ref', () => {
    const ref = 'github.com/project-flogo/contrib/activity/rest';
    expect(refAgent.registerRef(ref)).toEqual(refAgent.registerRef(ref));
  });

  test('it ensures types are unique', () => {
    expect(refAgent.registerRef('github.com/project-flogo/ACTIVITY/rest')).toEqual(
      '#rest'
    );
    expect(refAgent.registerRef('github.com/project-flogo/TRIGGER/rest')).toEqual(
      '#rest_1'
    );
    // repeated on purpose
    expect(refAgent.registerRef('github.com/project-flogo/TRIGGER/rest')).toEqual(
      '#rest_1'
    );
    expect(refAgent.registerRef('github.com/project-flogo/SOMETHING_ELSE/rest')).toEqual(
      '#rest_2'
    );
    expect(
      refAgent.registerRef('github.com/project-flogo/SOMETHING_ELSE/rest_1')
    ).toEqual('#rest_1_1');
  });

  test('it formats into the flogo.json imports syntax', () => {
    refAgent.registerRef('github.com/project-flogo/flow');
    refAgent.registerRef('github.com/project-flogo/contrib/activity/rest');
    refAgent.registerRef('github.com/project-flogo/contrib/trigger/rest');
    refAgent.registerRef('github.com/project-flogo/contrib/activity/log');
    refAgent.registerFunctionName('used.function');
    expect(refAgent.formatImports()).toEqual([
      'github.com/project-flogo/contrib/activity/log',
      'github.com/project-flogo/contrib/activity/rest',
      'rest_1 github.com/project-flogo/contrib/trigger/rest',
      'github.com/project-flogo/flow',
      'github.com/some-package-with-functions/ref',
    ]);
  });

  describe('with predetermined imports', () => {
    beforeEach(() => {
      refAgent = new RefAgent(functionsReverseLookupStub as FunctionRefFinder, [
        {
          ref: 'github.com/project-flogo/contrib/activity/rest',
          isAliased: true,
          type: 'myCoolRestAlias',
        },
        {
          ref: 'github.com/project-flogo/contrib/activity/log',
          isAliased: true,
          type: 'log',
        },
        {
          ref: 'github.com/project-flogo/contrib/activity/wont-be-used',
          isAliased: false,
          type: 'wont-be-used',
        },
      ]);
    });

    test('it should return the corresponding predetermined type when registering a matching ref', () => {
      expect(
        refAgent.registerRef('github.com/project-flogo/contrib/activity/rest')
      ).toEqual('#myCoolRestAlias');
    });

    test('it should consider the predetermined imports when ensuring type uniqueness', () => {
      expect(refAgent.registerRef('github.com/other-repo/log')).toEqual('#log_1');
    });

    test('it should format only the used the imports', () => {
      refAgent.registerRef('github.com/project-flogo/contrib/trigger/rest');
      refAgent.registerRef('github.com/project-flogo/contrib/activity/rest');
      refAgent.registerRef('github.com/external/repo/with-yet-another/rest');
      expect(refAgent.formatImports()).toEqual([
        'rest_1 github.com/external/repo/with-yet-another/rest',
        'myCoolRestAlias github.com/project-flogo/contrib/activity/rest',
        'github.com/project-flogo/contrib/trigger/rest',
      ]);
    });
  });
});
