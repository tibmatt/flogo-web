import { GraphNode } from '@flogo/core';
import { TileType, InsertTile, TaskTile } from '../interfaces/tile';

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

export function makeTaskTile(task: GraphNode): TaskTile {
  return {
    type: TileType.Task,
    task,
  };
}

export const tileFactory = {
  makePadding: () => PaddingTile,
  makePlaceholder: () => PlaceholderTile,
  makeTask: makeTaskTile,
  makeInsert: makeInsertTile,
};
