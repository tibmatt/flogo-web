import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

import { IMapping, Mappings } from '../../shared/mapper';
import { MapperTranslator, StaticMapperContextFactory } from '../../shared/mapper';
import { IFlogoFlowDiagramTaskAttribute } from '../../shared/diagram/models/attribute.model';
import { IFlogoFlowDiagramTask } from '../../shared/diagram/models/task.model';

import { MapperSchema } from '../models';
import { InputMapperConfig } from './input-mapper-config';

@Component({
  selector: 'flogo-flow-task-configurator-input-mapper',
  templateUrl: 'input-mapper.component.html',
  styleUrls: [ 'input-mapper.component.less' ],
})
export class InputMapperComponent implements OnInit {
  @Input() initialConfig: InputMapperConfig;
  @Input() mappings: Mappings;
  @Input() inputsSearchPlaceholder: string;
  @Input() outputsSearchPlaceholder: string;
  @Input() isIterableScope: boolean;

  @Output() mappingsChange = new EventEmitter<Mappings>();

  mapperContext: any;

  onMappingsChange(change: IMapping) {
    this.mappingsChange.emit(change.mappings);
  }

  ngOnInit() {
    const { propsToMap, inputScope } = this.initialConfig;
    const mappings = this.mappings || MapperTranslator.translateMappingsIn(this.initialConfig.inputMappings);
    this.mapperContext = this.createInputMapperContext(propsToMap, mappings, inputScope);
  }

  private createInputMapperContext(propsToMap: IFlogoFlowDiagramTaskAttribute[],
                                   mappings: Mappings,
                                   scope: IFlogoFlowDiagramTask[]) {
    const inputSchema = MapperTranslator.attributesToObjectDescriptor(propsToMap);
    const outputSchema = MapperTranslator.createOutputSchema(scope);
    const outputSchemaWithIterator = MapperTranslator.createOutputSchema(scope, { $current: this.getIteratorSchema() });
    const context = StaticMapperContextFactory.create(inputSchema, outputSchema, mappings);
    context.getScopedOutputSchemaProvider = () => {
      return {
        getSchema: () => this.isIterableScope ? outputSchemaWithIterator : outputSchema
      };
    };
    return context;
  }

  private getIteratorSchema(): MapperSchema {
    return {
      type: 'object',
      properties: {
        iteration: {
          type: 'object',
          properties: {
            key: {
              type: 'string'
            },
            value: {
              type: 'any'
            }
          }
        }
      }
    };
  }

}
