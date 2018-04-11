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
    <flogo-diagram-v2 [flow]="flow" [selection]="selection" (action)="onAction($event)"></flogo-diagram-v2>`,
  styles: [' :host { background-color: #efeded  } ']
})

export class DiagramTestComponent {
  flow = this.makeTestData();
  selection: DiagramSelection;
  // demo purposes
  count = 0;

  onAction(action: DiagramAction) {
    switch (action.type) {
      case DiagramActionType.Insert:
        this.selectInsert(<DiagramActionChild>action);
        break;
      case DiagramActionType.Remove:
        this.remove(<DiagramActionSelf>action);
        break;
      case DiagramActionType.Branch:
        this.branch((<DiagramActionChild>action).parentId);
        break;
      default:
        this.selectTask((<DiagramActionSelf>action).id);
        break;
    }
  }

  remove(action: DiagramActionSelf) {
    let flow = {...this.flow};
    const { [action.id]: nodeToRemove, ...nodes  } = flow.nodes;
    if (!nodeToRemove || (nodeToRemove.parents.length <= 0 && nodeToRemove.children.length <= 0)) {
      return;
    }
    flow.nodes = nodes;
    const [parentId] = nodeToRemove.parents;

    let parent;
    if (parentId) {
      parent = { ...flow.nodes[parentId] };
      parent.children = parent.children.filter(childId => childId !== nodeToRemove.id);
      flow.nodes = { ...flow.nodes, [parentId]: parent };
    }

    const substituteNodeWithChild = (childNode: Node) => {
      if (parent) {
        parent.children = parent.children.concat(childNode.id);
        flow.nodes = {
          ...flow.nodes,
          [parentId]: parent,
          [childNode.id]: {
            ...childNode,
            parents: childNode.parents
              .filter(childNodeParentId => childNodeParentId !== nodeToRemove.id)
              .concat(parent.id)
          },
        };
      } else {
        flow = { ...flow, rootId: childNode.id};
      }
    };

    const childBranches = [];
    if (nodeToRemove.type === NodeType.Task) {
      nodeToRemove.children
        .map(childId => this.flow.nodes[childId])
        .forEach(node => {
          if (node.type === NodeType.Task) {
            substituteNodeWithChild(node);
          } else {
            childBranches.push(node);
          }
        });
    } else {
      childBranches.push(nodeToRemove);
    }
    childBranches.forEach(branchNode => this.deleteChildren(branchNode, flow.nodes));
    this.flow = flow;
  }

  deleteChildren(node: Node, dictionary: Flow['nodes']) {
    node.children.forEach(childId => {
      const childNode = dictionary[childId];
      delete dictionary[childId];
      this.deleteChildren(childNode, dictionary);
    });
    return dictionary;
  }

  selectInsert(action: DiagramActionChild) {
    this.selection = {
      type: DiagramSelectionType.Insert,
      taskId: action.parentId
    };
  }

  add() {
    const { [this.selection.taskId]: parentNode } = this.flow.nodes;

    const newNode = this.newNode({
      type: NodeType.Task,
      parents: [parentNode.id],
      capabilities: {
        canBranch: true,
        canHaveChildren: true,
      }
    });

    this.insertNode(newNode, parentNode);
    this.selectTask(newNode.id);

  }

  branch(parentId: string) {
    const parentNode = this.flow.nodes[parentId];
    if (!parentNode || parentNode.type === NodeType.Branch) {
      return;
    }
    const newNode = this.newNode({
      type: NodeType.Branch,
      parents: [parentNode.id],
      capabilities: {
        canBranch: false,
        canHaveChildren: true,
      },
    });
    this.insertNode(newNode, parentNode);
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

  private insertNode(node: Node, parent: Node) {
    parent = { ...parent, children: [...parent.children, node.id] };
    const nodes = this.flow.nodes;
    this.flow = {
      ...this.flow,
      nodes: { ...nodes, [parent.id]: parent, [node.id]: node }
    };
  }

  private newNode(nodeData: Partial<Node> & {type: any}): Node {
    this.count += 1;
    const newId = `new_${this.count}`;
    return {
      ...nodeData,
      id: newId,
      parents: nodeData.parents ? [...nodeData.parents] : [],
      children: nodeData.children ? [...nodeData.children] : [],
      capabilities: nodeData.capabilities ? {...nodeData.capabilities } : {},
      status: nodeData.status ? {...nodeData.status } : {},
    };
  }

  private makeTestData(): Flow {
    const nodes: Partial<Node>[] = [
      {
        id: 'root',
        type: NodeType.Task,
        parents: [],
        children: ['B1', 'L-root-B2', 'L-root-B3', 'L-root-B4', 'L-root-B5'],
        capabilities: {
          canBranch: true,
          canHaveChildren: true,
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
        parents: ['B2'],
        children: [],
        capabilities: {
          canBranch: true,
          canHaveChildren: false,
        },
      },
      {
        id: 'L-root-B3',
        type: NodeType.Branch,
        parents: ['root'],
        children: ['B3'],
        capabilities: {
          canBranch: false,
          canHaveChildren: true,
        },
      },
      {
        id: 'B3',
        type: NodeType.Task,
        parents: ['L-root-B3'],
        children: [],
        capabilities: {
          canBranch: true,
          canHaveChildren: true,
        },
      },
      {
        id: 'L-root-B4',
        type: NodeType.Branch,
        parents: ['root'],
        children: ['B4'],
        capabilities: {
          canBranch: false,
          canHaveChildren: true,
        },
      },
      {
        id: 'B4',
        type: NodeType.Task,
        parents: ['L-root-B4'],
        children: [],
        capabilities: {
          canBranch: true,
          canHaveChildren: true,
        },
      },
      {
        id: 'L-root-B5',
        type: NodeType.Branch,
        parents: ['root'],
        children: ['B5'],
        capabilities: {
          canBranch: false,
          canHaveChildren: true,
        },
      },
      {
        id: 'B5',
        type: NodeType.Task,
        parents: ['L-root-B5'],
        children: [],
        capabilities: {
          canBranch: true,
          canHaveChildren: true,
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
