import { FlowGraph } from '@flogo/core';
import { createTileMatrix } from './create-tile-matrix';
import { nodesToNodeMatrix } from './nodes-to-node-matrix';
import { TileMatrix } from './matrix';

function makeRenderableMatrix(flow: FlowGraph, rowLength: number, isReadOnly = false): TileMatrix {
  const rootNode = flow && flow.rootId ? flow.nodes[flow.rootId] : null;
  if (!rootNode) {
    return [];
  }
  const nodeMatrix = nodesToNodeMatrix(rootNode, flow.nodes);
  return createTileMatrix(nodeMatrix, rowLength, isReadOnly);
}

export {
  makeRenderableMatrix,
  TileMatrix,
};