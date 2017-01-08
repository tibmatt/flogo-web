import { AppManager } from '../apps';

export function installDefaults() {
  return Promise.resolve([
    installDefaultApps(),
  ]);
}

export function installDefaultApps() {
  return AppManager.ensureDefaultApp();
}
