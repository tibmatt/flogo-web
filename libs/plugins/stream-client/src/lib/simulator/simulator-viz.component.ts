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
import { Observable, combineLatest } from 'rxjs';
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

  constructor(
    private zone: NgZone,
    private cd: ChangeDetectorRef,
    private perspectiveService: PerspectiveService
  ) {}

  ngOnDestroy() {
    this.destroy$.emitAndComplete();
  }

  ngOnChanges({ schema: schemaChanges, view: viewChanges }: SimpleChanges) {
    if (schemaChanges && !this.isStarting) {
      const viewer = this.getViewer();
      viewer.load(this.schema);
      this.setColumns();
    }
    if (viewChanges && this.view) {
      this.getViewer().setAttribute('view', this.view);
    }
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      combineLatest(
        this.perspectiveService.getWorker(),
        this.values$.pipe(
          scan((all: any[], value) => {
            all.unshift(value);
            return all.slice(0, VIZ_LIMIT);
          }, []),
          filter(values => values && values.length > 0)
        )
      )
        .pipe(
          takeUntil(this.destroy$),
          take(1)
        )
        .subscribe(([worker, values]: [PerspectiveWorker, any[]]) => {
          const viewer = this.getViewer();
          viewer.load(<any>this.schema, <any>{ limit: VIZ_LIMIT });
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
    this.values$
      .pipe(
        takeUntil(this.destroy$),
        scan((values, value) => {
          values.unshift(value);
          return values.slice(0, VIZ_LIMIT);
        }, [])
      )
      .subscribe(values => {
        this.getViewer().update(values);
      });
  }
}
