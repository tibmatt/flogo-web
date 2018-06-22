import {Injectable} from '@angular/core';
import { MapperControllerFactory } from '@flogo/flow/shared/mapper';
import { SettingsFormBuilder } from './settings-form-builder';
import { CurrentTriggerState, SettingControlInfo, SettingControlGroupType } from '../interfaces';
import { Dictionary, SchemaAttribute, TriggerSchema } from '@flogo/core';
import { createValidatorsForSchema } from '@flogo/flow/core/models';

@Injectable()
export class ConfigureDetailsService {
  constructor(private settingsFormBuilder: SettingsFormBuilder, private mapperControllerFactory: MapperControllerFactory) {}

  build(state: CurrentTriggerState) {
    const { flowMetadata, schema: triggerSchema, handler: { actionMappings }, fields } = state;
    const { input, output } = actionMappings;
    const settingsControlInfo = this.getAllSettingsControls(triggerSchema);
    return {
      settings: this.settingsFormBuilder.build(fields.settings, settingsControlInfo),
      flowInputMapper: this.createInputMapperController(flowMetadata, triggerSchema, input),
      replyMapper: this.createReplyMapperController(flowMetadata, triggerSchema, output),
      settingsControlInfo
    };
  }

  getAllSettingsControls(schema: TriggerSchema): Dictionary<SettingControlInfo> {
    const {settings: triggerSettings, handler} = schema;
    const {settings: handlerSettings} = handler;
    const settingsControlInfo = this.reduceSettingsAndGetInfo(triggerSettings, this.generateCreateControlInfo('triggerSettings'));
    return this.reduceSettingsAndGetInfo(handlerSettings, this.generateCreateControlInfo('handlerSettings'), settingsControlInfo);
  }

  private createReplyMapperController(flowMetadata, triggerSchema, output: any) {
    return this.mapperControllerFactory.createController(
      flowMetadata && flowMetadata.output ? flowMetadata.output : [],
      triggerSchema.reply || [],
      output,
    );
  }

  private createInputMapperController(flowMetadata, triggerSchema, input: any) {
    return this.mapperControllerFactory.createController(
      flowMetadata && flowMetadata.input ? flowMetadata.input : [],
      triggerSchema.outputs || [],
      input
    );
  }

  private reduceSettingsAndGetInfo(settings: SchemaAttribute[],
                                   createControlInfo: (string) => SettingControlInfo,
                                   initialValue: Dictionary<SettingControlInfo> = {}): Dictionary<SettingControlInfo> {
    return (settings || []).reduce((allSettings, setting) => {
      const controlInfo = createControlInfo(setting);
      allSettings[`${controlInfo.partOf}.${setting.name}`] = controlInfo;
      return allSettings;
    }, initialValue);
  }

  private generateCreateControlInfo(partOf: SettingControlGroupType) {
    return (settingSchema: SchemaAttribute): SettingControlInfo => ({
      ...settingSchema,
      partOf,
      propsAllowed: [],
      validations: createValidatorsForSchema(settingSchema)
    });
  }

}
