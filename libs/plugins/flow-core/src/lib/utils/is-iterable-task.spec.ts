import { isIterableTask, isAcceptableIterateValue } from './is-iterable-task';

describe('utils.isIterableTask', () => {
  test('It should check if the task is iterable or not', () => {
    expect(
      isIterableTask({
        settings: {
          iterate: 20,
        },
      })
    ).toEqual(true);
    expect(
      isIterableTask({
        settings: {
          iterate: '',
        },
      })
    ).toEqual(false);
  });
});

describe('utils.isAcceptableIterateValue', () => {
  test('It should check if the iterate value is acceptable', () => {
    expect(isAcceptableIterateValue(20)).toEqual(true);
    expect(isAcceptableIterateValue('20')).toEqual(true);
    expect(isAcceptableIterateValue('random.number(20)')).toEqual(true);
    expect(isAcceptableIterateValue(undefined)).toEqual(false);
    expect(isAcceptableIterateValue(null)).toEqual(false);
    expect(isAcceptableIterateValue('')).toEqual(false);
  });
});
