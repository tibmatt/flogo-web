import { GraphNode } from '@flogo/core';
import { Tile } from '../interfaces';

export interface NodeWithBranch {
  node: GraphNode;
  branch: GraphNode;
}

type Matrix<T> = T[][];
export type NodeMatrix = Matrix<GraphNode|NodeWithBranch|null>;
export type TileMatrix = Matrix<Tile>;

export const isNodeWithBranch = (node: any): node is NodeWithBranch => node && !!(<NodeWithBranch>node).branch;
