import { expect } from 'chai';
import { validatorFactory } from './validator-factory';

describe('importer.validator-factory', function () {
  let validator;
  beforeEach(function () {
    validator = validatorFactory(
      makeTestSchema(),
      { activities: ['ref/to/an/activity'], triggers: ['ref/to/a/trigger'] },
    );
  });

  it('should error for not installed contributions', function () {
    let thrownError;
    try {
      validator.validate({
        trigger: 'foo',
        activity: 'bar',
      });
    } catch (error) {
      thrownError = error;
    }
    expect(!!thrownError).to.equal(true, 'validation was expected to fail but no error was thrown');

    const { details: validationDetails } = thrownError.details.errors;
    expect(validationDetails).to.not.be.empty;

    expect(validationDetails[0]).to.deep.include({
      dataPath: '.trigger',
      keyword: 'trigger-installed',
      params: { ref: 'foo' },
    });
    expect(validationDetails[1]).to.deep.include({
      dataPath: '.activity',
      keyword: 'activity-installed',
      params: { ref: 'bar' },
    });
  });

  it('should allow installed contributions', function () {
    expect(validator.validate({
      trigger: 'ref/to/a/trigger',
      activity: 'ref/to/an/activity',
    })).not.to.throw;
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
