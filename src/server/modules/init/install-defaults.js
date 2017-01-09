import { AppsManager } from '../apps';

export function installDefaults() {
  return Promise.resolve([
    installDefaultApps(),
  ]);
}

export function installDefaultApps() {
  return AppsManager.ensureDefaultApp();
}
