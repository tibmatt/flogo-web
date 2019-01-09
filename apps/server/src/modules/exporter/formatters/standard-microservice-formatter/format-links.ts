import { FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE as LEGACY_LINK_TYPE } from '../../../../common/constants';
import { typeMapper } from '../../../transfer/common/type-mapper';

export function formatLinks(links = []) {
  const stdTypeMapper = typeMapper.toStandard();
  return links.map(fromLink => {
    const type =
      fromLink.type !== LEGACY_LINK_TYPE.DEFAULT
        ? stdTypeMapper.linkTypes[fromLink.type]
        : undefined;
    return {
      ...fromLink,
      id: undefined,
      type,
    };
  });
}
