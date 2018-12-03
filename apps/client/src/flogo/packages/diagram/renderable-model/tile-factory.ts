import { GraphNode } from '@flogo-web/client/core';
import { TileType, InsertTile, TaskTile } from '../interfaces/tile';

const PaddingTile = {
  type: TileType.Padding,
};

const PlaceholderTile = {
  type: TileType.Placeholder,
};

export function makeInsertTile(parentId: string): InsertTile {
  return {
    type: TileType.Insert,
    parentId,
  };
}

export function makeTaskTile(task: GraphNode, isTerminalInRow = false): TaskTile {
  return {
    type: TileType.Task,
    isTerminalInRow,
    task,
  };
}

export const tileFactory = {
  makePadding: () => PaddingTile,
  makePlaceholder: () => PlaceholderTile,
  makeTask: makeTaskTile,
  makeInsert: makeInsertTile,
};
