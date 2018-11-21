import { expect } from 'chai';
import { getInternalTasksPath } from './flow';
import { TASK_HANDLER_NAME_ROOT, TASK_HANDLER_NAME_ERROR } from '../constants';

describe('common.utils.flow', () => {
  describe('getInternalTasksPath()', () => {

    it('should return path of tasks for root handler', () => {
      expect(getInternalTasksPath(TASK_HANDLER_NAME_ROOT)).to.equal('tasks');
    });

    it('should return path of tasks for error handler', () => {
      expect(getInternalTasksPath(TASK_HANDLER_NAME_ERROR)).to.equal('errorHandler.tasks');
    });
  });
});
