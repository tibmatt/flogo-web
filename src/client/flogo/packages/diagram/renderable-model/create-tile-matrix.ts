import {times} from 'lodash';

import {GraphNodeDictionary, GraphNode } from '@flogo/core';
import {Tile} from '../interfaces/tile';

import {NodeMatrix, TileMatrix, NodeWithBranch, isNodeWithBranch} from './matrix';
import {tileFactory} from './tile-factory';

const TILE_PADDING = tileFactory.makePadding();
const TILE_PLACEHOLDER = tileFactory.makePlaceholder();
const fillWithPlaceholders = (fromCount: number, max: number) => times(max - fromCount, () => TILE_PLACEHOLDER);

type NodeCell = GraphNode | NodeWithBranch;
function isInsertAllowed(node: NodeCell) {
  return isNodeWithBranch(node) ? isInsertAllowed(node.node) : node.features && node.features.isMainBranch;
}

function getLastNode(rowOfNodes: Array<NodeCell>): GraphNode {
  const lastCell = rowOfNodes[rowOfNodes.length - 1];
  return isNodeWithBranch(lastCell) ? lastCell.branch : lastCell;
}

// assumes that the rows won't overflow
// and the overflow case should be handled somewhere else.
export function createTileMatrix(nodeMatrix: NodeMatrix, nodes: GraphNodeDictionary, maxRowLength, isReadOnly = false): TileMatrix {
  const maxTileIndex = maxRowLength - 1;
  const nodeToTile = (node: NodeCell, index) => !!node ? tileFactory.makeTask(node, index >= maxTileIndex) : TILE_PADDING;
  return nodeMatrix.map(rowOfNodes => {
    if (rowOfNodes.length <= 0) {
      return [];
    }
    const rowOfTiles: Tile[] = rowOfNodes.map(nodeToTile);
    const lastNode = getLastNode(rowOfNodes);
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
