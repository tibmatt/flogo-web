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
} from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { scan, filter, takeUntil, take } from 'rxjs/operators';
import { PerspectiveWorker } from '@finos/perspective';
import { PerspectiveService } from '../perspective.service';
import PerspectiveViewer from '@finos/perspective-viewer';

@Component({
  selector: 'flogo-stream-simulator-viz',
  templateUrl: './simulator-viz.component.html',
  styleUrls: ['./simulator-viz.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorVizComponent implements OnDestroy, AfterViewInit {
  @Input() values$: Observable<any[]>;
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

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      combineLatest(
        this.perspectiveService.getWorker(),
        this.values$.pipe(
          scan((all: any[], value) => {
            all.unshift(value);
            return all;
          }, []),
          filter(values => values && values.length > 0)
        )
      )
        .pipe(
          takeUntil(this.destroy$),
          take(1)
        )
        .subscribe(([, values]: [PerspectiveWorker, any[]]) => {
          this.isStarting = false;
          this.cd.markForCheck();
          this.viewerElem.nativeElement.load(values);
          this.listenForUpdates();
        });
    });
  }

  private getViewer(): PerspectiveViewer {
    return this.viewerElem && this.viewerElem.nativeElement;
  }

  private listenForUpdates() {
    this.values$.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.getViewer().update([value]);
    });
  }
}
