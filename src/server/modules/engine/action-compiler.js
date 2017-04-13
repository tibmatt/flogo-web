import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';

import { config } from '../../config/app-config';
import { getInitializedEngine } from '../../modules/engine/registry';
import { Engine } from '../../modules/engine';

import { logger } from '../../common/logging';

export class ActionCompiler {

  static compileFlow(trigger, flow, compileOptions) {
    compileOptions = compileOptions || {};

    // step: 1 add flow.json
    const flowName = 'flow';
    const tmpFlowJsonPath = path.join(config.rootPath, 'tmp', `${flowName}.json`);

    // todo: remove sync method
    // todo: clean flow
    logger.debug(`Saving flow to ${tmpFlowJsonPath}`);
    fse.outputJSONSync(tmpFlowJsonPath, flow);

    const triggerJson = {
      triggers: [],
    };
    triggerJson.triggers.push(trigger);
    const endpoint = trigger.endpoints[0];
    // TODO this is temp solution
    endpoint.actionType = 'flow';
    endpoint.actionURI = `embedded://${flowName}`;
    endpoint.flowURI = endpoint.actionURI;

    logger.debug('Will save trigger using config:', triggerJson);

    return getInitializedEngine(config.defaultEngine.path)
      .then(engine => engine.deleteAllInstalledFlows()
          .then(() => engine.addFlow(`file://${tmpFlowJsonPath}`))
          .then(() => Promise.all([
            // step2: update config.json
            engine.updateConfig(config.buildEngine.config, { type: Engine.TYPE_BUILD, overwrite: true }),
            // step3: update trigger.json
            engine.updateTriggersConfig(triggerJson, { type: Engine.TYPE_BUILD, overwrite: true }),
          ]))
          .then(() => engine.build({
            optimize: true,
            embedConfig: true,
            compile: compileOptions,
            type: Engine.TYPE_BUILD,
          })),
      )
      .then(result => fse.readFileSync(result.path));
  }

}
