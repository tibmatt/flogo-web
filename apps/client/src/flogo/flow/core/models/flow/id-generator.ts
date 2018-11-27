import { uniqueId } from 'lodash';

export function newBranchId() {
  return uniqueId('::branch::');
}
