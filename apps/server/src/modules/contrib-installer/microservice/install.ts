import { Engine } from '../../engine/engine';
import { normalizeContribUrl } from './url-parser';
import { logger } from '../../../common/logging';

export function install(
  contribUrl: string,
  contribType: 'activity' | 'trigger',
  engine: Engine
) {
  const packageUri = normalizeContribUrl(contribUrl);
  const installer = makeInstaller(engine, contribType);
  let installOrUpdatePromise: Promise<boolean>;

  if (installer.hasContrib(packageUri)) {
    logger.warn(`'${packageUri}' already exists. Updating it in the engine.`);
    installOrUpdatePromise = installer.update(packageUri);
  } else {
    installOrUpdatePromise = installer.install(packageUri, { version: 'latest' });
  }
  return installOrUpdatePromise.then(details => ({ ref: packageUri, details }));
}

function makeInstaller(engine: Engine, contribType: string) {
  const isActivity = contribType === 'activity';
  return {
    hasContrib: (isActivity ? engine.hasActivity : engine.hasTrigger).bind(engine) as (
      ref: string
    ) => boolean,
    install: (isActivity ? engine.addActivity : engine.addTrigger).bind(engine) as (
      ref: string,
      p: { version: string }
    ) => Promise<boolean>,
    update: engine.updateContribution.bind(engine) as (ref: string) => Promise<boolean>,
  };
}
