import { expect } from 'chai';
import { validatorFactory } from './validator-factory';

describe('validator-factory', function () {
  let validator;
  beforeEach(function () {
    validator = validatorFactory(
      makeTestSchema(),
      { activities: ['ref/to/an/activity'], triggers: ['ref/to/a/trigger'] }
    );
  });

  it('should error for not installed contributions', function () {
    const errors = validator.validate({
      trigger: 'foo',
      activity: 'bar',
    });
    expect(errors).to.not.be.empty;
    expect(errors[0]).to.deep.include({
      dataPath: '.trigger',
      keyword: 'trigger-installed',
      params: { ref: 'foo' },
    });
    expect(errors[1]).to.deep.include({
      dataPath: '.activity',
      keyword: 'activity-installed',
      params: { ref: 'bar' },
    });
  });

  it('should allow installed contributions', function () {
    const errors = validator.validate({
      trigger: 'ref/to/a/trigger',
      activity: 'ref/to/an/activity',
    });
    expect(errors).to.be.null;
  });

  function makeTestSchema() {
    return {
      type: 'object',
      properties: {
        trigger: {
          type: 'string',
          'trigger-installed': true,
        },
        activity: {
          type: 'string',
          'activity-installed': true,
        },
      },
    };
  }
});
