/**
 * This file initializes the server app's dependencies.
 * It should be imported at the very top of any server entrypoint.
 */

import './ensure-dir-structure';

export { rootContainer } from './init-dependencies';
export * from './install-defaults';
export * from './app';
