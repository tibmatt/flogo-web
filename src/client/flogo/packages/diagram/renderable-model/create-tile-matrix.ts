import {times} from 'lodash';

import {TaskTile, Tile} from '../interfaces/tile';

import {NodeMatrix, TileMatrix} from './matrix';
import {tileFactory} from './tile-factory';
import {GraphNodeDictionary, NodeType} from '@flogo/core';

const TILE_PADDING = tileFactory.makePadding();
const TILE_PLACEHOLDER = tileFactory.makePlaceholder();
const fillWithPlaceholders = (fromCount: number, max: number) => times(max - fromCount, () => TILE_PLACEHOLDER);

// assumes that the rows won't overflow
// and the overflow case should be handled somewhere else.
export function createTileMatrix(nodeMatrix: NodeMatrix, nodes: GraphNodeDictionary, maxRowLength, isReadOnly = false): TileMatrix {
  const maxTileIndex = maxRowLength - 1;
  const nodeToTile = (node, index) => !!node ? tileFactory.makeTask(node, index >= maxTileIndex) : TILE_PADDING;
  return nodeMatrix.map(rowOfNodes => {
    if (rowOfNodes.length <= 0) {
      return [];
    }
    const rowOfTiles: Tile[] = rowOfNodes.map(nodeToTile);
    rowOfTiles.forEach((rowOfTile: TaskTile) => {
      if (rowOfTile.task && rowOfTile.task.type === NodeType.Task) {
        const hasBranch = rowOfTile.task.children.find(child => nodes[child].type === NodeType.Branch);
        rowOfTile.hasBranch = !!hasBranch;
      }
    });
    const lastNode = rowOfNodes[rowOfNodes.length - 1];
    const isInsertAllowed = lastNode.features && lastNode.features.canHaveChildren;
    if (!isReadOnly && isInsertAllowed && rowOfTiles.length < maxRowLength) {
      return makeRowExtensible(rowOfTiles, lastNode.id, maxRowLength);
    }
    return rowOfTiles;
  });
}

function makeRowExtensible(rowOfTiles: Tile[], lastNodeId: string, maxRowLength: number) {
  const actionTile = tileFactory.makeInsert(lastNodeId);
  const placeholders = fillWithPlaceholders(rowOfTiles.length + 1, maxRowLength);
  return [...rowOfTiles, actionTile, ...placeholders];
}
