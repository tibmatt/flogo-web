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
} from '@angular/core';

import { PerspectiveWorker } from '@finos/perspective';
import PerspectiveViewer from '@finos/perspective-viewer';

import { Observable, combineLatest, pipe } from 'rxjs';
import { take, filter, scan, takeUntil, shareReplay, map } from 'rxjs/operators';

import { Metadata } from '@flogo-web/core';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { SimulatorService } from '../simulator.service';
import { PerspectiveService } from '../perspective.service';

@Component({
  selector: 'flogo-stream-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorComponent implements OnInit, OnDestroy {
  @Input() metadata?: Metadata;
  private destroy$ = SingleEmissionSubject.create();
  private input$: Observable<any>;
  private output$: Observable<any>;
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

  ngOnDestroy() {
    this.destroy$.emitAndComplete();
  }
}
