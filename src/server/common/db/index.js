import { generateShortId, ISONow } from './common';

export { apps } from './apps';
export { indexer } from './indexer';
export { contribs } from './contribs';

export const dbUtils = {
  /**
   * Generate short unique id
   * @type Function
   * @return {string}
   */
  generateShortId,
  /**
   * Returns current server date as ISO String
   * @type Function
   * @return {string}
   */
  ISONow,
};

