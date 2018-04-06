import { fromPairs } from 'lodash';
import { Component } from '@angular/core';
import {
  DiagramAction, DiagramActionChild, DiagramActionSelf, DiagramActionType, DiagramSelection, DiagramSelectionType, Flow, Node,
  NodeDictionary,
  NodeType
} from '@flogo/packages/diagram/interfaces';

@Component({
  selector: 'flogo-diagram-test',
  template: `
    <div>
      <button [disabled]="canAdd" (click)="add()">Add</button>
    </div>
    <flogo-diagram-v2 [flow]="flow" [selection]="selection" (action)="onAction($event)"></flogo-diagram-v2>`
})

export class DiagramTestComponent {
  flow = this.makeTestData();
  selection: DiagramSelection;
  // demo purposes
  count = 0;

  onAction(action: DiagramAction) {
    if (action.type === DiagramActionType.Insert) {
      this.selection = {
        type: DiagramSelectionType.Insert,
        taskId: (<DiagramActionChild>action).parentId
      };
    } else {
      this.selectTask((<DiagramActionSelf>action).id);
    }
  }

  add() {
    this.count += 1;
    const newId = `new_${this.count}`;
    const parentNode = {... this.flow.nodes[this.selection.taskId]};
    parentNode.children = [...parentNode.children, newId];

    const newNode = {
      id: newId,
      type: NodeType.Task,
      parents: [parentNode.id],
      children: [],
      capabilities: {
        canBranch: true,
        canHaveChildren: true,
      },
      status: {},
    };

    const nodes = this.flow.nodes;
    this.flow = {
      ...this.flow,
      nodes: { ...nodes, [parentNode.id]: parentNode, [newNode.id]: newNode }
    };
    this.selectTask(newNode.id);

  }

  get canAdd() {
    return !this.selection || this.selection.type !== DiagramSelectionType.Insert;
  }

  selectTask(taskId) {
    this.selection = {
      type: DiagramSelectionType.Node,
      taskId,
    };
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
