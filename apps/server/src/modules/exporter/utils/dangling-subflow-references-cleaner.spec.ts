import { DanglingSubflowReferencesCleaner } from './dangling-subflow-references-cleaner';

describe('exporter.utils.DanglingSubflowReferencesCleaner', () => {
  const task = {
    inputMappings: {
      foo: 'oof',
      dangling: 'abcd',
      bar: 'rab',
    },
  };
  const linkedFlow = {
    metadata: {
      input: [{ name: 'foo', type: 'string' }, { name: 'bar', type: 'string' }],
    },
  };
  const cleanMappings = DanglingSubflowReferencesCleaner.create().cleanMappings(
    task,
    linkedFlow
  );

  test('should remove dangling references', () => {
    expect(
      Object.keys(cleanMappings).find(mapping => mapping === 'dangling')
    ).toBeFalsy();
  });

  test('valid mappings should stay', () => {
    expect(Object.keys(cleanMappings)).toHaveLength(2);
    expect(cleanMappings).toEqual(
      expect.objectContaining({
        foo: 'oof',
        bar: 'rab',
      })
    );
  });
});
