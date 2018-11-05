import { GraphNode } from '@flogo/core';
import { TileType, InsertTile, TaskTile } from '../interfaces/tile';
import { NodeWithBranch, isNodeWithBranch } from './matrix';

const PaddingTile = {
  type: TileType.Padding,
};

const PlaceholderTile = {
  type: TileType.Placeholder
};

export function makeInsertTile(parentId: string): InsertTile {
  return {
    type: TileType.Insert,
    parentId,
  };
}

export function makeTaskTile(fromNode: GraphNode | NodeWithBranch, isTerminalInRow = false): TaskTile {
  let task;
  let branch = null;
  if (isNodeWithBranch(fromNode)) {
    task = fromNode.node;
    branch = fromNode.branch;
  } else {
    task = fromNode;
  }
  return {
    type: TileType.Task,
    isTerminalInRow,
    task,
    branch,
  };
}

export const tileFactory = {
  makePadding: () => PaddingTile,
  makePlaceholder: () => PlaceholderTile,
  makeTask: makeTaskTile,
  makeInsert: makeInsertTile,
};
