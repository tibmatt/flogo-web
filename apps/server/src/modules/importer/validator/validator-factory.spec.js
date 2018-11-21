import { expect } from 'chai';
import { validatorFactory } from './validator-factory';

describe('importer.validator-factory', () => {
  let validator;
  beforeEach(() => {
    validator = validatorFactory(
      makeTestSchema(),
      { activities: ['ref/to/an/activity'], triggers: ['ref/to/a/trigger'] },
    );
  });

  test('should error for not installed contributions', () => {
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

  test('should allow installed contributions', () => {
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
