import { isUndefined } from 'lodash';
import { FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE as LINK_TYPE } from '../../../common/constants';
import { Link } from '../../../interfaces';

const isConditionNotConfigured = (value) => isUndefined(value) || (value && value.toLowerCase().trim() === 'true');

export function handleMainBranchType(link: Link): Link {
  const {type, value} = determineLinkTypeAndValue(link);
  return {
    ...link,
    type,
    value
  };
}

function determineLinkTypeAndValue(link: Link): { type, value } & Partial<Link> {
  let type = link.type;
  let value = link.value;
  if (type === LINK_TYPE.MAIN_BRANCH) {
    if (isConditionNotConfigured(link.value)) {
      type = LINK_TYPE.DEFAULT;
      value = undefined;
    } else {
      type = LINK_TYPE.BRANCH;
    }
  }
  return {
    type,
    value
  };
}
