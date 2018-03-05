import isEmpty from 'lodash/isEmpty';
import { convertMappingsCollection } from '../../../transfer/common/convert-mappings';
import { typeMapper } from '../../../transfer/common/type-mapper';

const portMappings = convertMappingsCollection.bind(null, typeMapper.toStandard().mappingTypes);

export function portAndFormatMappings(actionMappings) {
  const portedMappings = portMappings(actionMappings);
  const formattedMappings = {};
  if (!isEmpty(portedMappings.input)) {
    formattedMappings.input = portedMappings.input;
  }
  if (!isEmpty(portedMappings.output)) {
    formattedMappings.output = portedMappings.output;
  }
  return formattedMappings;
}
