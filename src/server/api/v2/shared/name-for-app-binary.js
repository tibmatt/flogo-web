import kebabCase from 'lodash/kebabCase';
const notEmpty = value => !!value;
export function getNameForAppBinary(appName, { os: targetOs, arch: targetArch }) {
  let name = [ kebabCase(appName), targetOs || undefined, targetArch || undefined ]
    .filter(notEmpty)
    .join('_');
  if (targetOs === 'windows') {
    name = `${name}.exe`;
  }
  return name;
}
