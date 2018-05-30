import { Component, EventEmitter, Input, Output, OnInit, HostBinding } from '@angular/core';
import { Mappings, MapperTranslator, StaticMapperContextFactory } from '../../shared/mapper';
import { Task } from '@flogo/core';

const ITERABLE_VALUE_KEY = 'iterate';

@Component({
  selector: 'flogo-flow-task-configurator-iterator',
  templateUrl: 'iterator.component.html',
  styleUrls: [ 'iterator.component.less' ],
})
export class IteratorComponent implements OnInit {
  @Input() iteratorModeOn;
  @Input() initialConfig: {
    iterableValue: string;
    inputScope: any[];
  };
  @Output() changeIteratorMode = new EventEmitter();
  @Output() iteratorValueChange = new EventEmitter<string>();

  @HostBinding('class.--is-initing') isIniting = true;
  iteratorContext: any;

  ngOnInit() {
    this.iteratorContext = this.createIteratorContext(
      this.initialConfig.iterableValue, this.initialConfig.inputScope
    );
    setTimeout(() => this.isIniting = false, 0);
  }

  onChangeIteratorMode() {
    this.changeIteratorMode.emit();
  }

  onIteratorValueChange(change: Mappings) {
    const mapping = change[ITERABLE_VALUE_KEY];
    this.iteratorValueChange.emit(mapping ? mapping.expression : '');
  }

  private createIteratorContext(iterableValue: string, scope: Task[]) {
    const outputSchema = MapperTranslator.createOutputSchema(scope);
    return StaticMapperContextFactory.create({
      type: 'object',
      properties: {
        [ITERABLE_VALUE_KEY]: {
          type: 'string'
        }
      }
    }, outputSchema, {
      [ITERABLE_VALUE_KEY]: { expression: iterableValue, mappings: {} }
    });
  }

}
