import { Node } from '../interfaces/node';
import { Tile, TileType, InsertTile, TaskTile } from '../interfaces/tile';

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

export function makeTaskTile(task: Node): TaskTile {
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
