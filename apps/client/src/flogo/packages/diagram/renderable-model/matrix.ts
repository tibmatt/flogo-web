import { GraphNode } from '@flogo-web/client-core';
import { Tile } from '../interfaces';

type Matrix<T> = T[][];
export type NodeMatrix = Matrix<GraphNode | null>;
export type TileMatrix = Matrix<Tile>;
