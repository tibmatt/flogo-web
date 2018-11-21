import pick from 'lodash/pick';
import { expect } from 'chai';
import {prepareUpdateQuery} from './prepare-update-query';

describe('ActionsManager: prepareUpdateQuery', () => {
  const MockOldActionData = {
    'name': 'sample',
    'metadata': {},
    'tasks': [{}, {}],
    'links': [{}],
    'errorHandler': {
      'tasks': [{}, {}],
      'links': [{}]
    },
  };
  const MockNewActionData = {
    'name': 'sample new',
    'metadata': {},
    'tasks': [{}, {}],
    'links': [{}],
    'errorHandler': {
      'tasks': [{}, {}],
      'links': [{}]
    },
  };

  it('should create proper query for an action to update the db', () => {
    const query = prepareUpdateQuery(MockNewActionData, MockOldActionData, 1);
    expect(query).to.all.keys('$set').and.not.to.have.any.keys('$unset')
      .to.nested.include({'actions.1.name': 'sample new'});
    expect(query.$set).to.include.all.keys('actions.1.tasks', 'actions.1.links', 'actions.1.errorHandler');
  });

  it('should create proper query for an action with no main handler tasks', () => {
    const testData = pick(MockNewActionData, ['name', 'metadata', 'errorHandler']);
    const query = prepareUpdateQuery(testData, MockOldActionData, 1);
    expect(query).to.all.keys('$set', '$unset');
    expect(query.$set).to.include.all.keys('actions.1.errorHandler')
      .and.not.to.have.any.keys('actions.1.tasks', 'actions.1.links');
    expect(query.$unset).to.deep.include({'actions.1.tasks': true, 'actions.1.links': true});
  });

  it('should create proper query for an action with no error handler tasks', () => {
    const testData = pick(MockNewActionData, ['name', 'metadata', 'tasks', 'links']);
    const query = prepareUpdateQuery(testData, MockOldActionData, 1);
    expect(query).to.all.keys('$set', '$unset');
    expect(query.$set).to.include.all.keys('actions.1.tasks', 'actions.1.links')
      .and.not.to.have.any.keys('actions.1.errorHandler');
    expect(query.$unset).to.deep.include({'actions.1.errorHandler': true});
  });
});
