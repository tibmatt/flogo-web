import { GraphNode } from '@flogo/core';

export enum TileType {
  Padding = 'padding',
  Insert = 'insert',
  Placeholder = 'placeholder',
  Task = 'task',
}

interface BaseTile {
  type: TileType;
}

export type  Tile = InsertTile | TaskTile | BaseTile;

export interface InsertTile extends BaseTile {
  type: TileType.Insert;
  parentId: string;
  isRoot?: boolean;
}

export interface TaskTile extends BaseTile {
  type: TileType.Task;
  task: GraphNode;
}
