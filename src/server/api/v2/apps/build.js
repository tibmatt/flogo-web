import kebabCase from 'lodash/kebabCase';
import { AppsManager } from '../../../modules/apps/index.v2';

export function* buildApp() {
  this.req.setTimeout(0);
  const appId = this.params.appId;
  const options = { compile: {} };

  options.compile.os = this.query.os || null;
  options.compile.arch = this.query.arch || null;

  const result = yield AppsManager.build(appId, options);
  const name = getNameForFile(result.appName, options.compile);
  this.attachment(name);
  this.body = result.data;
}

function getNameForFile(appName, { os: targetOs, arch: targetArch }) {
  let name = [
    kebabCase(appName),
    targetOs || undefined,
    targetArch || undefined,
  ].join('_');
  if (targetOs === 'windows') {
    name = `${name}.exe`;
  }
  return name;
}

