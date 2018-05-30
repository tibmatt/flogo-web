import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

import { Mappings } from '../../shared/mapper';
import { MapperTranslator, StaticMapperContextFactory } from '../../shared/mapper';
import { TaskAttribute, Task } from '@flogo/core';

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

  onMappingsChange(change: Mappings) {
    this.mappingsChange.emit(change);
  }

  ngOnInit() {
    const { propsToMap, inputScope } = this.initialConfig;
    const mappings = this.mappings || MapperTranslator.translateMappingsIn(this.initialConfig.inputMappings);
    this.mapperContext = this.createInputMapperContext(propsToMap, mappings, inputScope);
  }

  private createInputMapperContext(propsToMap: TaskAttribute[],
                                   mappings: Mappings,
                                   scope: Task[]) {
    const inputSchema = MapperTranslator.attributesToObjectDescriptor(propsToMap);
    const iteratorSchema = this.isIterableScope ? { $current: this.getIteratorSchema() } : null;
    const outputSchema =  MapperTranslator.createOutputSchema(scope, iteratorSchema);
    return StaticMapperContextFactory.create(inputSchema, outputSchema, mappings);
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
