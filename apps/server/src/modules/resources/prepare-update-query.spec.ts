import { pick } from 'lodash';
import { prepareUpdateQuery } from './prepare-update-query';

describe('ActionsManager: prepareUpdateQuery', () => {
  const MockOldActionData = {
    name: 'sample',
    metadata: {},
    tasks: [{}, {}],
    links: [{}],
    errorHandler: {
      tasks: [{}, {}],
      links: [{}],
    },
  };
  const MockNewActionData = {
    name: 'sample new',
    metadata: {},
    tasks: [{}, {}],
    links: [{}],
    errorHandler: {
      tasks: [{}, {}],
      links: [{}],
    },
  };

  it('should create proper query for an action to update the db', () => {
    const query = prepareUpdateQuery(MockNewActionData, MockOldActionData, 1);
    expect(query).toHaveProperty('$set');
    expect(query).not.toHaveProperty('$unset');
    expect(query.$set).toHaveProperty(['actions.1.name'], 'sample new');
    expect(Object.keys(query.$set)).toEqual(
      expect.arrayContaining([
        'actions.1.tasks',
        'actions.1.links',
        'actions.1.errorHandler',
      ])
    );
  });

  it('should create proper query for an action with no main handler tasks', () => {
    const testData = pick(MockNewActionData, ['name', 'metadata', 'errorHandler']);
    const query = prepareUpdateQuery(testData, MockOldActionData, 1);
    expect(Object.keys(query)).toEqual(expect.arrayContaining(['$set', '$unset']));
    expect(query.$set).toHaveProperty(['actions.1.errorHandler']);
    expect(Object.keys(query.$set)).not.toEqual(
      expect.arrayContaining(['actions.1.tasks', 'actions.1.links'])
    );
    expect(query.$unset).toMatchObject({
      'actions.1.tasks': true,
      'actions.1.links': true,
    });
  });

  it('should create proper query for an action with no error handler tasks', () => {
    const testData = pick(MockNewActionData, ['name', 'metadata', 'tasks', 'links']);
    const query = prepareUpdateQuery(testData, MockOldActionData, 1);
    expect(Object.keys(query)).toEqual(expect.arrayContaining(['$set', '$unset']));
    expect(Object.keys(query.$set)).toEqual(
      expect.arrayContaining(['actions.1.tasks', 'actions.1.links'])
    );
    expect(query.$set).not.toHaveProperty(['actions.1.errorHandler']);
    expect(query.$unset).toMatchObject({ 'actions.1.errorHandler': true });
  });
});
