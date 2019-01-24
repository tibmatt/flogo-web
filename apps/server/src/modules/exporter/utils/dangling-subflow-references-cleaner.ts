import isEmpty from 'lodash/isEmpty';
import pick from 'lodash/pick';

export class DanglingSubflowReferencesCleaner {
  static create() {
    return new DanglingSubflowReferencesCleaner();
  }

  cleanMappings(task, linkedFlow) {
    const linkedFlowInputMetadata = this.getFlowMetadata(linkedFlow);
    if (!linkedFlowInputMetadata || isEmpty(task.inputMappings)) {
      return [];
    }
    const linkedFlowInputExists = (flowInputs, propName) =>
      !!flowInputs.find(i => i.name === propName);

    const linkedFlowInputNames = linkedFlowInputMetadata.map(input => input.name);
    const finalMappingNames = Object.keys(task.inputMappings).filter(mapping =>
      linkedFlowInputExists(linkedFlowInputNames, mapping)
    );
    task.inputMappings = pick(task.inputMappings, finalMappingNames);
    return task.inputMappings;
  }

  getFlowMetadata(linkedFlow) {
    if (linkedFlow && linkedFlow.metadata && linkedFlow.metadata.input) {
      return linkedFlow.metadata.input;
    }
    return null;
  }
}
