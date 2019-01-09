import { validatorFactory } from './validator-factory';

describe('importer.validator-factory', () => {
  let validator;
  beforeEach(() => {
    validator = validatorFactory(makeTestSchema(), {
      activities: ['ref/to/an/activity'],
      triggers: ['ref/to/a/trigger'],
    });
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
    expect(!!thrownError).toBe(true);

    const { details: validationDetails } = thrownError.details.errors;
    expect(Object.keys(validationDetails)).not.toHaveLength(0);

    expect(validationDetails[0]).toMatchObject({
      dataPath: '.trigger',
      keyword: 'trigger-installed',
      params: { ref: 'foo' },
    });
    expect(validationDetails[1]).toMatchObject({
      dataPath: '.activity',
      keyword: 'activity-installed',
      params: { ref: 'bar' },
    });
  });

  test('should allow installed contributions', () => {
    expect(() =>
      validator.validate({
        trigger: 'ref/to/a/trigger',
        activity: 'ref/to/an/activity',
      })
    ).not.toThrowError();
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
