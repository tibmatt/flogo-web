import { Engine } from '../../engine/engine';
import { normalizeContribUrl } from './url-parser';

export async function install(contribUrl: string, contribType: 'activity' | 'trigger', engine: Engine) {
  const packageUri = normalizeContribUrl(contribUrl);
  const installer = makeInstaller(engine, contribType);

  if (installer.hasContrib(packageUri)) {
     await installer.remove(packageUri);
  }
  return installer
    .install(packageUri, {version: 'latest'})
    .then(details => ({ ref: packageUri, details }));
}

function makeInstaller(engine: Engine, contribType: string) {
  const isActivity = contribType === 'activity';
  return {
    hasContrib: (isActivity ? engine.hasActivity : engine.hasTrigger).bind(engine) as (ref: string) => boolean,
    install: (isActivity ? engine.addActivity : engine.addTrigger).bind(engine) as (ref: string, p: { version: string }) => Promise<boolean>,
    remove: (isActivity ? engine.deleteActivity : engine.deleteTrigger).bind(engine) as (ref: string) => Promise<string>,
  };
}
