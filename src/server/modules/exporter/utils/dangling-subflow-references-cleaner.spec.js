import { expect } from 'chai';
import { DanglingSubflowReferencesCleaner } from './dangling-subflow-references-cleaner';

describe('exporter.utils.DanglingSubflowReferencesCleaner', function () {
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
  const cleanMappings = DanglingSubflowReferencesCleaner
    .create()
    .cleanMappings(task, linkedFlow);

  it('should remove dangling references', function () {
    expect(cleanMappings.find(mapping => mapping.name === 'dangling')).to.not.be.ok;
  });

  it('valid mappings should stay', function () {
    expect(cleanMappings).to.have.length(2)
      .and.to.deep.include.members([
        { mapTo: 'foo', value: 'oof', type: 2 },
        { mapTo: 'bar', value: 'rab', type: 2 },
      ]);
  });
});
