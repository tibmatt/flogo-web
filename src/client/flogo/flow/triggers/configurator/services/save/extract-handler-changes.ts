import { fromPairs } from 'lodash';
import { FormGroup } from '@angular/forms';
import { AttributeMapping } from '@flogo/core';
import { TriggerHandler } from '@flogo/flow/core';
import { MapperController, MapperTranslator } from '@flogo/flow/shared/mapper';
import { SettingControlGroup } from '../../interfaces';
import { SaveParams } from './save-params';

export function extractHandlerChanges(oldHandler: TriggerHandler, {settings, flowInputMapper, replyMapper}: SaveParams) {
  const changes = [];
  const settingChanges = checkForSettingChanges(settings);
  if (settingChanges) {
    changes.push([ 'settings', settingChanges ]);
  }
  const mappingChanges = checkForMappingChanges(oldHandler, flowInputMapper, replyMapper);
  if (mappingChanges) {
    changes.push([ 'actionMappings', mappingChanges ]);
  }
  return changes.length > 0 ? fromPairs(changes) : null;
}

function checkForSettingChanges(settings: FormGroup) {
  if (!settings && !settings.dirty) {
    return null;
  }
  const handlerSettingsControl = settings.get(SettingControlGroup.HANDLER);
  if (handlerSettingsControl && handlerSettingsControl.dirty) {
    return handlerSettingsControl.value;
  }
  return null;
}

function checkForMappingChanges(prevHandler: TriggerHandler, flowInputMapper?: MapperController, replyMapper?: MapperController) {
  const originalMappings = prevHandler.actionMappings;
  let newMappings = originalMappings;
  if (flowInputMapper) {
    newMappings = {...newMappings, input: extractMappings(flowInputMapper)};
  }
  if (replyMapper) {
    newMappings = {...newMappings, output: extractMappings(replyMapper)};
  }
  return newMappings !== originalMappings ? newMappings : null;
}

function extractMappings(mapperController: MapperController): AttributeMapping[] {
  return MapperTranslator.translateMappingsOut(mapperController.getMappings());
}
