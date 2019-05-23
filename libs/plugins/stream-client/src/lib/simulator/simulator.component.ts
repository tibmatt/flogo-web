import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  NgZone,
  OnInit,
  OnDestroy,
} from '@angular/core';

import { PerspectiveWorker } from '@finos/perspective';
import PerspectiveViewer from '@finos/perspective-viewer';

import { Observable, combineLatest, pipe } from 'rxjs';
import { take, filter, scan, tap, takeUntil, shareReplay, map } from 'rxjs/operators';

import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { SimulatorService } from '../simulator.service';
import { PerspectiveService } from '../perspective.service';

@Component({
  selector: 'flogo-stream-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('inputView') inputView: ElementRef;
  @ViewChild('outputView') outputView: ElementRef;
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

  ngAfterViewInit() {
    if (!this.inputView || !this.inputView.nativeElement) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.listen(this.input$, this.inputView.nativeElement);
      this.listen(this.output$, this.outputView.nativeElement);
    });
  }

  ngOnDestroy() {
    this.destroy$.emitAndComplete();
  }

  private listen(values$: Observable<any[]>, viewer: PerspectiveViewer) {
    this.zone.runOutsideAngular(() => {
      combineLatest(
        this.perspectiveService.getWorker().pipe(tap(w => console.log('getWorker', w))),
        values$.pipe(
          scan((all: any[], value) => {
            all.unshift(value);
            return all;
          }, []),
          filter(values => values && values.length > 0),
          tap(() => console.log('v'))
        )
      )
        .pipe(
          takeUntil(this.destroy$),
          take(1)
        )
        .subscribe(([, values]: [PerspectiveWorker, any[]]) => {
          console.log('init');
          viewer.load(values);
          this.listenForUpdates(values$, viewer);
        });
    });
  }

  private listenForUpdates(values$: Observable<any[]>, viewer: PerspectiveViewer) {
    values$.pipe(takeUntil(this.destroy$)).subscribe(value => {
      viewer.update([value]);
    });
  }
}
