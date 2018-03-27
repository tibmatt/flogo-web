import { Node, Tile } from '../interfaces/index';

type Matrix<T> = T[][];
export type NodeMatrix = Matrix<Node|null>;
export type TileMatrix = Matrix<Tile>;
