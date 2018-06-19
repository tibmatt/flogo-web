import {Injectable} from '@angular/core';
import { MapperControllerFactory } from '@flogo/flow/shared/mapper';
import { SettingsFormBuilder } from './settings-form-builder';
import { CurrentTriggerState, SettingControlInfo, SettingControlGroupType } from '../interfaces';
import {AbstractControl, ValidatorFn, Validators} from '@angular/forms';
import {SchemaAttribute, TriggerSchema, ValueType} from '@flogo/core';

@Injectable()
export class ConfigureDetailsService {
  constructor(private settingsFormBuilder: SettingsFormBuilder, private mapperControllerFactory: MapperControllerFactory) {}

  build(state: CurrentTriggerState) {
    const { flowMetadata, schema: triggerSchema, handler: { actionMappings }, fields } = state;
    const { input, output } = actionMappings;
    const settingsControlInfo = this.getAllSettingsControls(triggerSchema);
    return {
      settings: this.settingsFormBuilder.build(fields.settings, triggerSchema, settingsControlInfo),
      flowInputMapper: this.createInputMapperController(flowMetadata, triggerSchema, input),
      replyMapper: this.createReplyMapperController(flowMetadata, triggerSchema, output),
      settingsControlInfo
    };
  }

  getAllSettingsControls(schema: TriggerSchema) {
    const {settings: triggerSettings, handler} = schema;
    const {settings: handlerSettings} = handler;
    const triggerSettingsControlFn = this.controlInfoCreator('triggerSettings');
    const handlerSettingsControlFn = this.controlInfoCreator('handlerSettings');
    const settingsControlInfo = this.reduceSettingsAndGetInfo(triggerSettings, triggerSettingsControlFn);
    return this.reduceSettingsAndGetInfo(handlerSettings, handlerSettingsControlFn, settingsControlInfo);
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

  private reduceSettingsAndGetInfo(settings: SchemaAttribute[], controlInfoGenerator, initialValue = {}) {
    return (settings || []).reduce((allSettings, setting) => {
      const controlInfo = controlInfoGenerator(setting);
      allSettings[`${controlInfo.partOf}.${setting.name}`] = controlInfo;
      return allSettings;
    }, initialValue);
  }

  private controlInfoCreator(partOf: SettingControlGroupType) {
    return (settingSchema: SchemaAttribute): SettingControlInfo => ({
      ...settingSchema,
      partOf,
      propsAllowed: [],
      validations: this.generateValidatorFunctions(settingSchema)
    });
  }

  private generateValidatorFunctions(schema: SchemaAttribute) {
    const validateFunctions: ValidatorFn[] = [];
    if (schema.required) {
      validateFunctions.push(Validators.required);
    }
    if (schema.allowed) {
      validateFunctions.push(this.generateValidatorInAllowed(schema.allowed));
    }
    // validator based on type of the setting
    const validationFnByType = this.generateValidatorByType(schema.type);
    if (validationFnByType) {
      validateFunctions.push(validationFnByType);
    }
    return validateFunctions;
  }

  private generateValidatorByType(type: ValueType): ValidatorFn {
    switch (type) {
      case ValueType.Integer:
      case ValueType.Long:
      case ValueType.Double:
        return (control: AbstractControl) => {
          return isNaN(Number(control.value)) ? {'typeMismatch': {'expectedType': type}} : null;
        };
      case ValueType.Boolean:
        return (control: AbstractControl) => {
          const valueToCheck = control.value.toString();
          const failedValidation = !(valueToCheck === 'true' || valueToCheck === 'false');
          return failedValidation ? {'typeMismatch': {'expectedType': type}} : null;
        };
      default:
        return null;
    }
  }

  private generateValidatorInAllowed(allowed: SchemaAttribute['allowed']) {
    return (control: AbstractControl) => {
      /* tslint:disable-next-line:triple-equals */
      const failedValidation = !allowed.find(val => val == control.value);
      return failedValidation ? {'notAllowed': {'allowedValues': allowed}} : null;
    };
  }

}
