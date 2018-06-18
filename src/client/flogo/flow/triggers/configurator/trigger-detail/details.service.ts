import {Injectable} from '@angular/core';
import { MapperControllerFactory } from '@flogo/flow/shared/mapper';
import { SettingsFormBuilder } from './settings-form-builder';
import { CurrentTriggerState } from '@flogo/flow/triggers/configurator/interfaces';

@Injectable()
export class ConfigureDetailsService {
  constructor(private settingsFormBuilder: SettingsFormBuilder, private mapperControllerFactory: MapperControllerFactory) {}

  build(state: CurrentTriggerState) {
    const { flowMetadata, schema: triggerSchema, handler: { actionMappings }, fields } = state;
    const { input, output } = actionMappings;
    return {
      settings: this.settingsFormBuilder.build(fields.settings, triggerSchema),
      flowInputMapper: this.createInputMapperController(flowMetadata, triggerSchema, input),
      replyMapper: this.createReplyMapperController(flowMetadata, triggerSchema, output),
    };
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

}
