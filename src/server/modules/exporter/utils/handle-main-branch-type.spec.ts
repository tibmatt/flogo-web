import { expect } from 'chai';
import { handleMainBranchType } from './handle-main-branch-type';
import { FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE as LINK_TYPE } from '../../../common/constants';

describe('exporter.utils.handleMainBranchType', () => {
  it('Should format the links with main branch as expected', () => {
    const formattedLinks = [{
      'id': 1,
      'from': 'task_1',
      'to': 'task_2'
    }, {
      'id': 2,
      'from': 'task_1',
      'to': 'task_3',
      'type': LINK_TYPE.BRANCH,
      'value': 'true'
    }, {
      'id': 3,
      'from': 'task_1',
      'to': 'task_4',
      'type': LINK_TYPE.BRANCH,
      'value': 'Some expression'
    }, {
      'id': 4,
      'from': 'task_1',
      'to': 'task_5',
      'type': LINK_TYPE.MAIN_BRANCH,
      'value': 'true'
    }, {
      'id': 5,
      'from': 'task_1',
      'to': 'task_2',
      'type': LINK_TYPE.MAIN_BRANCH,
      'value': 'Some condition'
    }].map(handleMainBranchType);

    expect(formattedLinks).to.deep.equal([{
      'id': 1,
      'from': 'task_1',
      'to': 'task_2',
      'type': undefined,
      'value': undefined
    }, {
      'id': 2,
      'from': 'task_1',
      'to': 'task_3',
      'type': LINK_TYPE.BRANCH,
      'value': 'true'
    }, {
      'id': 3,
      'from': 'task_1',
      'to': 'task_4',
      'type': LINK_TYPE.BRANCH,
      'value': 'Some expression'
    }, {
      'id': 4,
      'from': 'task_1',
      'to': 'task_5',
      'type': LINK_TYPE.DEFAULT,
      'value': undefined
    }, {
      'id': 5,
      'from': 'task_1',
      'to': 'task_2',
      'type': LINK_TYPE.BRANCH,
      'value': 'Some condition'
    }]);
  });
});
