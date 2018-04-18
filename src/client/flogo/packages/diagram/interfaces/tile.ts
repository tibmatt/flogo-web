import { GraphNode } from '@flogo/core';

export enum TileType {
  Padding = 'padding',
  Insert = 'insert',
  Placeholder = 'placeholder',
  Task = 'task',
}

export interface Tile {
  type: TileType;
}

export interface InsertTile extends Tile {
  type: TileType.Insert;
  parentId: string;
}

export interface TaskTile extends Tile {
  type: TileType.Task;
  task: GraphNode;
}
