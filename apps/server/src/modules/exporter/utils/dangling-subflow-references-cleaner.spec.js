import { DanglingSubflowReferencesCleaner } from './dangling-subflow-references-cleaner';

describe('exporter.utils.DanglingSubflowReferencesCleaner', () => {
  const task = {
    inputMappings: [
      { mapTo: 'foo', value: 'oof', type: 2 },
      { mapTo: 'dangling', value: 'abcd', type: 2 },
      { mapTo: 'bar', value: 'rab', type: 2 },
    ],
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
    expect(cleanMappings.find(mapping => mapping.name === 'dangling')).toBeFalsy();
  });

  test('valid mappings should stay', () => {
    expect(cleanMappings).toHaveLength(2);
    expect(cleanMappings).toEqual(
      expect.arrayContaining([
        { mapTo: 'foo', value: 'oof', type: 2 },
        { mapTo: 'bar', value: 'rab', type: 2 },
      ])
    );
  });
});
