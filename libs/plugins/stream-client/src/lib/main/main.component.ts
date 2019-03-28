import { fromPairs, isArray, isObjectLike, isEmpty } from 'lodash';
import {
  Component,
  ViewChild,
  AfterViewInit,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { fromEvent, merge, ReplaySubject, EMPTY, of } from 'rxjs';
import {
  switchMap,
  debounceTime,
  takeUntil,
  map,
  tap,
  filter,
  delay,
  catchError,
} from 'rxjs/operators';
import { Router } from '@angular/router';

import { Resource } from '@flogo-web/core';
import {
  ActivatedResourceRoute,
  ResourceService,
  SingleEmissionSubject,
  FlowGraph,
  Dictionary,
  NodeType,
  GraphNode,
} from '@flogo-web/lib-client/core';
import { isString } from 'util';

@Component({
  selector: 'flogo-web-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements AfterViewInit, OnDestroy {
  public editData: string;
  public stream: Resource<any>;
  public saving = false;
  private error: string;
  private ngDestroy$ = SingleEmissionSubject.create();
  private loadedStream = new ReplaySubject<any>(1);
  @ViewChild('streamEdit') textArea: ElementRef;
  renderableStream: FlowGraph;

  constructor(
    private activatedResource: ActivatedResourceRoute,
    private resourceApiService: ResourceService,
    private router: Router
  ) {
    this.setStream(this.activatedResource.resource);
  }

  back() {
    this.router.navigate(['/apps', (<any>this.stream).appId]);
  }

  save(editData) {
    try {
      this.saving = true;
      const data = JSON.parse(editData);
      this.resourceApiService
        .updateResource(this.stream.id, { ...this.stream, data })
        .pipe(switchMap(() => this.resourceApiService.getResource(this.stream.id)))
        .subscribe(r => (this.stream = r));
    } catch (e) {
      console.log('Could not parse', this.editData);
    }
    this.saving = false;
  }

  ngAfterViewInit(): void {
    merge(
      this.loadedStream.pipe(
        map(r => r && r.data),
        delay(0)
      ),
      fromEvent(this.textArea.nativeElement, 'input').pipe(
        debounceTime(500),
        takeUntil(this.ngDestroy$),
        map((e: any) => e.target.value),
        switchMap(value => {
          try {
            return of(JSON.parse(value));
          } catch (e) {
            this.error = 'Malformed data (not a valid json?)';
            return EMPTY;
          }
        })
      )
    )
      .pipe(
        catchError(e => {
          console.error(e);
          return EMPTY;
        }),
        filter(Boolean)
      )
      .subscribe(
        value => {
          let data;
          this.error = null;
          this.renderableStream = null;
          if (isString(value)) {
            try {
              data = JSON.parse(value);
            } catch (e) {
              this.error = 'Malformed data (not a valid json?)';
              console.error(e);
            }
          } else if (isObjectLike(value)) {
            data = value;
          } else {
            return;
          }

          if (!data || !data.tasks || !data.tasks[0]) {
            return;
          } else if (data.tasks[0] && !data.tasks[0].id) {
            this.error = 'Missing id for root task';
          }

          if (this.error) {
            return;
          }

          const rootId = data.tasks[0].id;
          this.renderableStream = {
            rootId: data.tasks[0].id,
            nodes: toNodes(rootId, data),
          };
        },
        () => {}
      );
  }

  ngOnDestroy() {
    this.ngDestroy$.emitAndComplete();
  }

  private setStream(stream) {
    this.stream = stream;
    this.editData = JSON.stringify(this.stream.data, null, 1);
    this.loadedStream.next(stream);
  }
}

function toNodes(rootId, data): FlowGraph['nodes'] {
  const nodes: FlowGraph['nodes'] =
    !isEmpty(data.tasks) && isArray(data.tasks)
      ? fromPairs(
          data.tasks
            .filter(t => isObjectLike(t) && t.id)
            .map(t => [
              t.id,
              {
                id: t.id,
                title: t.name || 'No name',
                type: NodeType.Task,
                children: [],
                parents: [],
                status: {},
                features: {
                  final: false,
                  canHaveChildren: true,
                },
              } as GraphNode,
            ])
        )
      : {};

  const links: Dictionary<any> =
    !isEmpty(data.links) && isArray(data.links)
      ? data.links.filter(l => isObjectLike(l) && l.from && l.to)
      : [];

  let branchIdCount = 0;
  links.forEach(link => {
    const fromNode = nodes[link.from];
    const toNode = nodes[link.to];
    if (!fromNode || !toNode) {
      return;
    }

    if (link.type === 'expression') {
      const branchId = `branch__${branchIdCount++}`;
      nodes[branchId] = {
        id: branchId,
        type: NodeType.Branch,
        children: [toNode.id],
        parents: [fromNode.id],
        status: {},
        features: {},
      };
      fromNode.children.push(branchId);
      toNode.parents.push(branchId);
    } else {
      fromNode.children.push(toNode.id);
      toNode.parents.push(fromNode.id);
    }
  });

  return nodes;
}
