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
import perspective, { PerspectiveWorker, Table } from '@finos/perspective';
import { fromEvent, Observable, ReplaySubject, Subscription } from 'rxjs';
import {
  take,
  filter,
  scan,
  switchMap,
  withLatestFrom,
  shareReplay,
  tap,
  takeUntil,
} from 'rxjs/operators';

import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { SimulatorService } from '../simulator.service';

@Component({
  selector: 'flogo-stream-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('inputView') inputView: ElementRef;
  @ViewChild('outputView') outputView: ElementRef;
  private worker: PerspectiveWorker;
  private table: Table;
  private values$: Observable<any>;
  private destroy$ = SingleEmissionSubject.create();

  constructor(private zone: NgZone, private simulationService: SimulatorService) {}

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      this.values$ = this.simulationService.data$.pipe(
        scan((acc: any[], val) => {
          acc.unshift(val);
          return acc.slice(0, 5);
        }, []),
        filter(values => values && values.length > 0)
      );
    });
  }

  ngAfterViewInit() {
    if (!this.inputView || !this.inputView.nativeElement) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.worker = perspective.worker();
      fromEvent(window, 'perspective-ready')
        .pipe(
          withLatestFrom(this.values$),
          takeUntil(this.destroy$),
          take(1)
        )
        .subscribe(([, values]) => {
          this.table = this.worker.table(values, {
            index: null,
            limit: 100,
          });
          this.inputView.nativeElement.load(this.table);
          this.outputView.nativeElement.load(this.table);
          this.listenForUpdates();
        });
    });
  }

  ngOnDestroy() {
    this.destroy$.emitAndComplete();
  }

  private listenForUpdates() {
    this.values$.pipe(takeUntil(this.destroy$)).subscribe(values => {
      this.table.update(values);
    });
  }
}
