import { Component, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { isEmpty } from 'lodash';

import { ValueType, Metadata as ResourceMetadata } from '@flogo-web/core';

import {
  DiagramSelection,
  DiagramAction,
  DiagramActionType,
  DiagramActionSelf,
  DiagramSelectionType,
} from '@flogo-web/lib-client/diagram';
import { SimulatorService } from '../simulator.service';
import { ParamsSchemaComponent } from '../params-schema';
import { FlogoFlowService, StreamParams } from '../core';
import { FlowState } from '../core/state';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { FlogoFlowService as FlowsService } from '../core/flow.service';
import { NotificationsService } from '@flogo-web/lib-client/notifications';

@Component({
  selector: 'flogo-stream-designer',
  templateUrl: './stream-designer.component.html',
  styleUrls: ['./stream-designer.component.less'],
  providers: [SimulatorService],
})
export class StreamDesignerComponent implements OnDestroy {
  flowState: FlowState;
  isPanelOpen = false;
  isMenuOpen = false;
  backToAppHover = false;
  graph;
  currentSelection: DiagramSelection;
  resourceMetadata: Partial<ResourceMetadata> = {
    input: [
      { name: 'ID', type: ValueType.String },
      { name: 'timeslot', type: ValueType.Integer },
      { name: 'pressure', type: ValueType.Integer },
      { name: 'amps', type: ValueType.Integer },
    ],
    output: [
      { name: 'out1', type: ValueType.Integer },
      { name: 'out2', type: ValueType.Integer },
    ],
  };
  flowName: string;
  private ngOnDestroy$ = SingleEmissionSubject.create();

  @ViewChild('metadataModal') metadataModal: ParamsSchemaComponent;

  constructor(
    private simulationService: SimulatorService,
    private streamService: FlogoFlowService,
    private router: Router,
    private _flowService: FlowsService,
    private notifications: NotificationsService
  ) {
    const { mainGraph, mainItems } = mockResource();
    this.graph = mainGraph;
    this.streamService.currentFlowDetails.flowState$
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(flowState => {
        this.flowState = flowState;
        this.flowName = flowState.name;
      });
  }

  get flowId() {
    return this.flowState && this.flowState.id;
  }

  ngOnDestroy() {
    this.ngOnDestroy$.emitAndComplete();
  }

  get applicationId() {
    return this.flowState && this.flowState.appId;
  }

  togglePanel() {
    this.isPanelOpen = !this.isPanelOpen;

    if (this.isPanelOpen) {
      // this.simulationService.startSimulation({
      //   input: [{ name: 'field1', type: ValueType.Integer }],
      //   output: [{ name: 'field2', type: ValueType.String }],
      // });

      this.simulationService.startSimulation(this.resourceMetadata || {});
    } else {
      this.simulationService.stopSimulation();
    }
  }

  onDiagramAction(action: DiagramAction) {
    if (action.type === DiagramActionType.Select) {
      this.currentSelection = {
        diagramId: 'stream',
        taskId: (action as DiagramActionSelf).id,
        type: DiagramSelectionType.Node,
      };
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  deleteStream() {
    this.closeMenu();
  }

  navigateToApp() {
    // todo: nice to have: this.activatedResource.navigateToApp()
    // or: this.router.navigate(this.activatedResource.getAppUrl());
    this.router.navigate(['/apps', this.applicationId]);
  }

  onMouseOverBackControl() {
    this.backToAppHover = true;
  }

  onMouseOutBackControl() {
    this.backToAppHover = false;
  }

  openMetadataModal() {
    this.metadataModal.openInputSchemaModel();
  }

  onResourceMetadataSave(params: StreamParams) {
    this.resourceMetadata = { ...params.metadata };
    if (this.isPanelOpen) {
      this.simulationService.startSimulation(this.resourceMetadata);
    }
    this.streamService.currentFlowDetails.updateMetadata(params);
  }

  public changeFlowDetailName(name, property) {
    if (name === this.flowName) {
      return Promise.resolve(true);
    } else if (!name || !name.trim()) {
      this.flowState.name = this.flowName;
      return Promise.resolve(true);
    }

    return this._flowService
      .listFlowsByName(this.flowState.appId, name)
      .then(flows => {
        const results = flows || [];
        if (!isEmpty(results)) {
          if (results[0].id === this.flowId) {
            return;
          }
          this.flowState.name = this.flowName;
          this.notifications.error({
            key: 'CANVAS:FLOW-NAME-EXISTS',
            params: { value: name },
          });
          return results;
        } else {
          this.flowState.name = name;
          this._updateFlow()
            .then((response: any) => {
              this.notifications.success({
                key: 'CANVAS:SUCCESS-MESSAGE-UPDATE-STREAM',
                params: { value: property },
              });
              this.flowName = this.flowState.name;
              return response;
            })
            .catch(err => {
              this.notifications.error({
                key: 'CANVAS:ERROR-MESSAGE-UPDATE-STREAM',
                params: { value: property },
              });
              return Promise.reject(err);
            });
        }
      })
      .catch(err => {
        this.notifications.error({
          key: 'CANVAS:ERROR-MESSAGE-UPDATE-STREAM',
          params: { value: property },
        });
        return Promise.reject(err);
      });
  }

  private _updateFlow() {
    return this._flowService.saveFlowIfChanged(this.flowId, this.flowState).toPromise();
  }

  public changeFlowDetail($event, property) {
    return this._updateFlow()
      .then(wasSaved => {
        if (wasSaved) {
          this.notifications.success({
            key: 'CANVAS:SUCCESS-MESSAGE-UPDATE-STREAM',
            params: { value: property },
          });
        }
        return wasSaved;
      })
      .catch(() =>
        this.notifications.error({
          key: 'CANVAS:ERROR-MESSAGE-UPDATE-STREAM',
          params: { value: property },
        })
      );
  }
}

function mockResource() {
  return {
    mainItems: {
      log_3: {
        name: 'Log',
        description: 'Logs a message',
        settings: {},
        ref: 'github.com/project-flogo/contrib/activity/log',
        id: 'log_3',
        inputMappings: {
          message: '',
          addDetails: false,
        },
        type: 1,
        return: false,
        activitySettings: {},
        input: {
          message: '',
          addDetails: false,
        },
      },
      filter_4: {
        name: 'Filter',
        description: 'Simple Filter Activity',
        settings: {},
        ref: 'github.com/project-flogo/stream/activity/filter',
        id: 'filter_4',
        inputMappings: {},
        type: 1,
        return: false,
        activitySettings: {},
        input: {
          value: null,
        },
      },
      aggregate_5: {
        name: 'Aggregate',
        description: 'Simple Aggregate Activity',
        settings: {},
        ref: 'github.com/project-flogo/stream/activity/aggregate',
        id: 'aggregate_5',
        inputMappings: {},
        type: 1,
        return: false,
        activitySettings: {},
        input: {
          value: null,
        },
      },
    },
    mainGraph: {
      rootId: 'log_3',
      nodes: {
        log_3: {
          type: 'task',
          id: 'log_3',
          title: 'Log',
          description: 'Logs a message',
          features: {
            selectable: true,
            canHaveChildren: true,
            canBranch: false,
            deletable: true,
            subflow: false,
            final: false,
          },
          status: {
            invalid: false,
            executed: false,
            executionErrored: null,
            iterable: false,
          },
          children: ['filter_4'],
          parents: [],
        },
        filter_4: {
          type: 'task',
          id: 'filter_4',
          title: 'Filter',
          description: 'Simple Filter Activity',
          features: {
            selectable: true,
            canHaveChildren: true,
            canBranch: false,
            deletable: true,
            subflow: false,
            final: false,
          },
          status: {
            invalid: false,
            executed: false,
            executionErrored: null,
            iterable: false,
          },
          children: ['aggregate_5'],
          parents: ['log_3'],
        },
        aggregate_5: {
          type: 'task',
          id: 'aggregate_5',
          title: 'Aggregate',
          description: 'Simple Aggregate Activity',
          features: {
            selectable: true,
            canHaveChildren: true,
            canBranch: false,
            deletable: true,
            subflow: false,
            final: false,
          },
          status: {
            invalid: false,
            executed: false,
            executionErrored: null,
            iterable: false,
          },
          children: [],
          parents: ['filter_4'],
        },
      },
    },
  };
}
