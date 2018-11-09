import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import {FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE} from '../../../common/constants';
import {safeGetLinksInHandler} from '../../../common/utils/flow';

const normalizeBranchTypeWhileFindingMainBranch = (links) => {
  let foundMainBranch = false;
  links.forEach(link => {
    if ((isUndefined(link.type) || link.type === FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.DEFAULT) && !foundMainBranch) {
      link.type = FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.MAIN_BRANCH;
      foundMainBranch = true;
    } else {
      link.type = FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.BRANCH;
    }
  });
};

const updateLinkTypeWithMainBranch = (linksGroup) => {
  if (linksGroup.length > 1) {
    normalizeBranchTypeWhileFindingMainBranch(linksGroup);
  }
};

export function normalizeLinksWithMainBranch(action, handlerName) {
  const links = safeGetLinksInHandler(action, handlerName);
  if (!isEmpty(links)) {
    const linksGroupedByFrom = groupBy(links, 'from');
    Object.values(linksGroupedByFrom).forEach(updateLinkTypeWithMainBranch);
  }
}
