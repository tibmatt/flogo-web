import isEmpty from 'lodash/isEmpty';
import intersection from 'lodash/intersection';

export class DanglingSubflowReferencesCleaner {
  static create() {
    return new DanglingSubflowReferencesCleaner();
  }

  cleanMappings(task, linkedFlow) {
    const linkedFlowInputMetadata = this.getFlowMetadata(linkedFlow);
    if (!linkedFlowInputMetadata || isEmpty(task.inputMappings)) {
      return [];
    }

    const mappedPropNamesInTask = task.inputMappings.map(mapping => mapping.mapTo);
    const linkedFlowInputNames = linkedFlowInputMetadata.map(input => input.name);
    const finalMappingNames = intersection(mappedPropNamesInTask, linkedFlowInputNames);

    return task.inputMappings.filter(inputMapping => finalMappingNames.includes(inputMapping.mapTo));
  }

  getFlowMetadata(linkedFlow) {
    if (linkedFlow && linkedFlow.metadata && linkedFlow.metadata.input) {
      return linkedFlow.metadata.input;
    }
    return null;
  }
}
