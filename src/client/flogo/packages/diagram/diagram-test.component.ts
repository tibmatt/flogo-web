import { fromPairs } from 'lodash';
import { Component } from '@angular/core';
import {
  DiagramAction, DiagramActionChild, DiagramActionType, DiagramSelection, DiagramSelectionType, Flow, Node, NodeDictionary,
  NodeType
} from '@flogo/packages/diagram/interfaces';

@Component({
  selector: 'flogo-diagram-test',
  template: `
    <flogo-diagram-v2 [flow]="flow" [selection]="selection" (action)="onAction($event)"></flogo-diagram-v2>`
})

export class DiagramTestComponent {
  flow = this.makeTestData();
  selection: DiagramSelection;

  onAction(action: DiagramAction) {
    if (action.type === DiagramActionType.Insert) {
      this.selection = {
        type: DiagramSelectionType.Insert,
        taskId: (<DiagramActionChild>action).parentId
      };
    }
  }

  makeTestData(): Flow {
    const nodes: Partial<Node>[] = [
      {
        id: 'root',
        type: NodeType.Task,
        parents: [],
        children: ['B1', 'L-root-B2'],
        capabilities: {
          canBranch: true,
        }
      },
      {
        id: 'B1',
        type: NodeType.Task,
        parents: ['root'],
        children: ['C1'],
        capabilities: {
          canBranch: true,
          canHaveChildren: true,
        }
      },
      {
        id: 'C1',
        type: NodeType.Task,
        parents: ['B1'],
        children: [],
        capabilities: {
          canBranch: true,
          canHaveChildren: true,
        },
      },
      {
        id: 'L-root-B2',
        type: NodeType.Branch,
        parents: ['root'],
        children: ['B2'],
        capabilities: {
          canBranch: false,
          canHaveChildren: true,
        },
      },
      {
        id: 'B2',
        type: NodeType.Task,
        parents: ['L-root-B2'],
        children: ['C2'],
        capabilities: {
          canBranch: true,
          canHaveChildren: true,
        },
      },
      {
        id: 'C2',
        type: NodeType.Task,
        parents: ['C2'],
        children: [],
        capabilities: {
          canBranch: true,
          canHaveChildren: false,
        },
      }
    ];
    const nodeDictionary: NodeDictionary = fromPairs(
      nodes.map(node => [node.id, { ...node, capabilities: node.capabilities || {}, status: node.status || {} }]),
    );
    const { root } = nodeDictionary;
    return { rootId: root.id, nodes: nodeDictionary };
  }

}
