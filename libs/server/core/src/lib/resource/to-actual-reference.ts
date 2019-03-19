import { ContributionType } from '@flogo-web/core';
import { ImportsRefAgent } from '../extensions';

const ALIAS_PREFIX = '#';
// Allow users to use old contribution reference and replace it with it's new reference
const UPGRADE_SPECIAL_CONTRIB = new Map<string, string>([
  [
    'github.com/TIBCOSoftware/flogo-contrib/activity/actreply',
    'github.com/project-flogo/contrib/activity/actreply',
  ],
  [
    'github.com/TIBCOSoftware/flogo-contrib/activity/actreturn',
    'github.com/project-flogo/contrib/activity/actreturn',
  ],
  [
    'github.com/TIBCOSoftware/flogo-contrib/activity/mapper',
    'github.com/project-flogo/contrib/activity/mapper',
  ],
  [
    'github.com/TIBCOSoftware/flogo-contrib/activity/subflow',
    'github.com/project-flogo/flow/activity/subflow',
  ],
]);

export function toActualReference(
  contribRef: string,
  contribType: ContributionType,
  agent: ImportsRefAgent
): string {
  let actualRef = contribRef;
  if (contribRef.startsWith(ALIAS_PREFIX)) {
    actualRef = agent.getPackageRef(contribType, contribRef.substr(1));
  }
  // return the contrib's upgraded reference path if any or the actual ref
  return UPGRADE_SPECIAL_CONTRIB.get(actualRef) || actualRef;
}
