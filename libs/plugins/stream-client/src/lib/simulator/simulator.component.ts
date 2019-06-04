import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  NgZone,
  OnInit,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { Observable, pipe } from 'rxjs';
import { filter, shareReplay, map } from 'rxjs/operators';

import { Metadata, ValueType } from '@flogo-web/core';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { SimulatorService } from '../simulator.service';
import { PerspectiveService } from '../perspective.service';

interface Schemas {
  input?: { [field: string]: string };
  output?: { [field: string]: string };
}

@Component({
  selector: 'flogo-stream-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() metadata?: Metadata;
  @Input() simulateActivity;
  private destroy$ = SingleEmissionSubject.create();
  private input$: Observable<any>;
  private output$: Observable<any>;
  private schemas: Schemas;
  constructor(
    private zone: NgZone,
    private perspectiveService: PerspectiveService,
    private simulationService: SimulatorService
  ) {}

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      const values$ = this.simulationService.data$.pipe(shareReplay());

      const accumulate = transportType =>
        pipe(
          filter((event: any) => event && event.transport === transportType),
          map(event => event.value)
        );

      this.input$ = values$.pipe(accumulate('input'));
      this.output$ = values$.pipe(accumulate('output'));
    });
  }

  ngOnChanges({ metadata: metadataChange }: SimpleChanges) {
    if (metadataChange) {
      this.updateSchemas();
    }
  }

  updateSchemas() {
    this.schemas = {};
    if (!this.metadata) {
      return;
    }

    const translateFields = fieldTranslator();

    if (this.metadata.input && this.metadata.input.length > 0) {
      this.schemas.input = this.metadata.input.reduce(translateFields, {});
    }

    if (this.metadata.output && this.metadata.output.length > 0) {
      this.schemas.output = this.metadata.output.reduce(translateFields, {});
    }
  }

  ngOnDestroy() {
    this.destroy$.emitAndComplete();
  }
}

function fieldTranslator() {
  const translateFieldType = (type: ValueType) => {
    switch (type) {
      case ValueType.Double:
      case ValueType.Long:
        return 'float';
        break;
      case ValueType.Integer:
        return 'integer';
        break;
      case ValueType.Boolean:
        return 'boolean';
        break;
      default:
        return 'string';
        break;
    }
  };

  return (schema, field) => {
    schema[field.name] = translateFieldType(field.type);
    return schema;
  };
}
