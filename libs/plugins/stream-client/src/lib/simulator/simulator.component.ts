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
import { PerspectiveWorker, Table } from '@finos/perspective';
import { Observable, combineLatest } from 'rxjs';
import { take, filter, scan, tap, takeUntil } from 'rxjs/operators';

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
  private table: Table;
  private values$: Observable<any>;
  private destroy$ = SingleEmissionSubject.create();

  constructor(
    private zone: NgZone,
    private perspectiveService: PerspectiveService,
    private simulationService: SimulatorService
  ) {}

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      this.values$ = this.simulationService.data$.pipe(
        scan((all: any[], val) => {
          all.unshift(val);
          return all;
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
      combineLatest(
        this.perspectiveService.getWorker().pipe(tap(v => console.log('getWorker', v))),
        this.values$.pipe(tap(() => console.log('v')))
      )
        .pipe(
          takeUntil(this.destroy$),
          take(1)
        )
        .subscribe(([worker, values]: [PerspectiveWorker, any[]]) => {
          console.log('init');
          this.table = worker.table(values, {
            index: null,
            limit: 25,
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
