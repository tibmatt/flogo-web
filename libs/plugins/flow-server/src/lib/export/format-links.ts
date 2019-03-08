import { isEmpty } from 'lodash';
import { EXPR_PREFIX } from '@flogo-web/core';
import { typeMapper, allFunctionsUsedIn } from '@flogo-web/server/core';
import { FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE as LEGACY_LINK_TYPE } from '../constants';

export function formatLinks(links = []) {
  const stdTypeMapper = typeMapper.toStandard();
  return links.map(fromLink => {
    const type =
      fromLink.type !== LEGACY_LINK_TYPE.DEFAULT
        ? stdTypeMapper.linkTypes[fromLink.type]
        : undefined;
    if (!isEmpty(fromLink.value)) {
      const functionsUsed = allFunctionsUsedIn({
        condition: EXPR_PREFIX + fromLink.value,
      });
    }
    return {
      ...fromLink,
      id: undefined,
      type,
    };
  });
}
