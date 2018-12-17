import isEmpty from 'lodash/isEmpty';
import { portMappings } from '../../../transfer/common/convert-mappings';
import { typeMapper } from '../../../transfer/common/type-mapper';

const mappingsExporter = portMappings.bind(null, typeMapper.toStandard().mappingTypes);

export function portAndFormatMappings(actionMappings) {
  const portedMappings = mappingsExporter(actionMappings);
  const formattedMappings: {
    input?: any;
    output?: any;
  } = {};
  if (!isEmpty(portedMappings.input)) {
    formattedMappings.input = portedMappings.input;
  }
  if (!isEmpty(portedMappings.output)) {
    formattedMappings.output = portedMappings.output;
  }
  return formattedMappings;
}
