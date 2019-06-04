import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy,
  NgZone,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Observable, combineLatest, pipe, Subscription } from 'rxjs';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { scan, filter, takeUntil, take } from 'rxjs/operators';
import { PerspectiveWorker } from '@finos/perspective';
import { PerspectiveService } from '../perspective.service';
import PerspectiveViewer from '@finos/perspective-viewer';

const VIZ_LIMIT = 20;

@Component({
  selector: 'flogo-stream-simulator-viz',
  templateUrl: './simulator-viz.component.html',
  styleUrls: ['./simulator-viz.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorVizComponent implements OnDestroy, AfterViewInit, OnChanges {
  @Input() values$: Observable<any[]>;
  @Input() schema: { [name: string]: string };
  @Input() view: string;
  @ViewChild('viewer') viewerElem: ElementRef;
  public isStarting = true;
  private destroy$ = SingleEmissionSubject.create();
  private valueChangeSubscription: Subscription;

  constructor(
    private zone: NgZone,
    private cd: ChangeDetectorRef,
    private perspectiveService: PerspectiveService
  ) {}

  ngOnDestroy() {
    this.destroy$.emitAndComplete();
  }

  ngOnChanges({ schema: schemaChanges, view: viewChanges }: SimpleChanges) {
    if (this.isStarting) {
      return;
    }
    if (schemaChanges) {
      // const viewer = this.getViewer();
      // viewer.load(this.schema);
      // this.setColumns();
      // this.listenForUpdates();
      this.configure();
    }
    if (viewChanges && this.view) {
      this.getViewer().setAttribute('view', this.view);
    }
  }

  private configure() {
    this.zone.runOutsideAngular(() => {
      combineLatest(
        this.perspectiveService.getWorker(),
        this.values$.pipe(valueAccumulator())
      )
        .pipe(
          takeUntil(this.destroy$),
          take(1)
        )
        .subscribe(([worker, values]: [PerspectiveWorker, any[]]) => {
          const viewer = this.getViewer();
          const table = worker.table(this.schema, <any>{ limit: VIZ_LIMIT });
          table.update(values);
          // table.
          viewer.load(<any>table, <any>{ limit: VIZ_LIMIT });
          if (this.view) {
            viewer.setAttribute('view', this.view);
          }
          this.setColumns();
          this.listenForUpdates();

          this.isStarting = false;
          this.cd.detectChanges();
        });
    });
  }

  ngAfterViewInit() {
    this.configure();
  }

  setView(viewName: string) {
    const viewer = this.getViewer();
    const currentViewName = viewer.getAttribute('view');
    if (currentViewName !== viewName) {
      viewer.setAttribute('view', viewName);
      this.view = viewName;
      this.cd.markForCheck();
    }
  }

  private setColumns() {
    this.getViewer().setAttribute('columns', JSON.stringify(Object.keys(this.schema)));
  }

  private getViewer(): PerspectiveViewer {
    return this.viewerElem && this.viewerElem.nativeElement;
  }

  private listenForUpdates() {
    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe();
    }
    this.valueChangeSubscription = this.values$
      .pipe(
        takeUntil(this.destroy$),
        valueAccumulator()
      )
      .subscribe(values => {
        this.getViewer().update(values);
      });
  }
}

function accumulateValues(values, value) {
  values.unshift(value);
  return values.slice(0, VIZ_LIMIT);
}

function isNotEmpty(values) {
  return values && values.length > 0;
}

function valueAccumulator() {
  return pipe(
    scan(accumulateValues, []),
    filter(isNotEmpty)
  );
}
