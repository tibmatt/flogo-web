import { RefAgent } from './ref-agent';

describe('ref agent', () => {
  let refAgent: RefAgent;

  beforeEach(() => {
    refAgent = new RefAgent();
  });

  test('it returns the type from a ref', () => {
    expect(
      refAgent.registerRef('github.com/project-flogo/contrib/activity/rest')
    ).toEqual('rest');
  });

  test('it returns the same type for the same ref', () => {
    const ref = 'github.com/project-flogo/contrib/activity/rest';
    expect(refAgent.registerRef(ref)).toEqual(refAgent.registerRef(ref));
  });

  test('it ensures types are unique', () => {
    expect(refAgent.registerRef('github.com/project-flogo/ACTIVITY/rest')).toEqual(
      'rest'
    );
    expect(refAgent.registerRef('github.com/project-flogo/TRIGGER/rest')).toEqual(
      'rest_1'
    );
    // repeated on purpose
    expect(refAgent.registerRef('github.com/project-flogo/TRIGGER/rest')).toEqual(
      'rest_1'
    );
    expect(refAgent.registerRef('github.com/project-flogo/SOMETHING_ELSE/rest')).toEqual(
      'rest_2'
    );
  });

  test('it formats into the flogo.json imports syntax', () => {
    refAgent.registerRef('github.com/project-flogo/flow');
    refAgent.registerRef('github.com/project-flogo/contrib/activity/rest');
    refAgent.registerRef('github.com/project-flogo/contrib/trigger/rest');
    refAgent.registerRef('github.com/project-flogo/contrib/activity/log');
    expect(refAgent.formatImports()).toEqual([
      'github.com/project-flogo/flow',
      'github.com/project-flogo/contrib/activity/rest',
      'rest_1 github.com/project-flogo/contrib/trigger/rest',
      'github.com/project-flogo/contrib/activity/log',
    ]);
  });
});
