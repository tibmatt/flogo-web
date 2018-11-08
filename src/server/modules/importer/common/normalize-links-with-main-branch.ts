import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import {FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE} from '../../../common/constants';
import {safeGetLinksInHandler} from '../../../common/utils/flow';

const normalizeBranchType = (link, idx) => {
  if (idx === 0) {
    link.type = FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.MAIN_BRANCH;
    return;
  }
  link.type = FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.BRANCH;
};

const updateLinkTypeWithMainBranch = (linksGroup) => {
  if (linksGroup.length > 1) {
    linksGroup.forEach(normalizeBranchType);
  /*} else if (linksGroupedByFrom[taskId][0].type === FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.BRANCH) {
      // need to create an empty main branch and store it to the database*/
  }
};

export function normalizeLinksWithMainBranch(action, handlerName) {
  const links = safeGetLinksInHandler(action, handlerName);
  if (!isEmpty(links)) {
    const linksGroupedByFrom = groupBy(links, 'from');
    Object.values(linksGroupedByFrom).forEach(updateLinkTypeWithMainBranch);
  }
}
