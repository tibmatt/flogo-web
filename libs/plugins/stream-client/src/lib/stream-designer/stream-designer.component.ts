import { Observable } from 'rxjs';
import { scan } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { ValueType } from '@flogo-web/core';
import {
  DiagramSelection,
  DiagramAction,
  DiagramActionType,
  DiagramActionSelf,
  DiagramSelectionType,
} from '@flogo-web/lib-client/diagram';

import { SimulatorService } from '../simulator.service';

@Component({
  selector: 'flogo-stream-designer',
  templateUrl: './stream-designer.component.html',
  styleUrls: ['./stream-designer.component.less'],
  providers: [SimulatorService],
})
export class StreamDesignerComponent implements OnInit {
  isPanelOpen = false;
  simulationData$: Observable<any[]>;
  isMenuOpen = false;
  backToAppHover = false;
  testingData = 'Anand';
  testingData1 = 'Some description';
  graph;
  currentSelection: DiagramSelection;

  constructor(private simulationService: SimulatorService) {
    const { mainGraph, mainItems } = mockResource();
    this.graph = mainGraph;
  }

  ngOnInit() {
    this.simulationData$ = this.simulationService.data$.pipe(
      scan((acc: any[], val) => {
        acc.unshift(val);
        return acc.slice(0, 5);
      }, [])
    );
  }

  togglePanel() {
    this.isPanelOpen = !this.isPanelOpen;

    if (this.isPanelOpen) {
      this.simulationService.startSimulation([
        { name: 'field1', type: ValueType.Integer },
        { name: 'field2', type: ValueType.String },
      ]);
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

  navigateToApp() {}

  onMouseOverBackControl() {
    this.backToAppHover = true;
  }

  onMouseOutBackControl() {
    this.backToAppHover = false;
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
