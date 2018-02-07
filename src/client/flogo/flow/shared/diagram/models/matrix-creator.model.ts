import * as _ from 'lodash';

import { IFlogoFlowDiagramNode } from './node.model';
import { IFlogoFlowDiagram } from './diagram.interface';
import { IFlogoFlowDiagramNodeDictionary } from './dictionary.model';
import { FLOGO_FLOW_DIAGRAM_NODE_TYPE } from '../constants';

export function diagramToRenderableMatrix(diagram: IFlogoFlowDiagram, rowLength: number) {
  return filterOverflowAddNode(
    padMatrix(
      transformDiagram(diagram), rowLength, diagram
    ), diagram.nodes
    , rowLength);
}

function padMatrix(matrix: string [][], rowLen, diagram: IFlogoFlowDiagram): string[][] {
  const outputMatrix: string[][] = [];
  const isReturnActivity = task => task && task.return;

  _.each(
    matrix, (matrixRow) => {
      const taskID = diagram.nodes[matrixRow[matrixRow.length - 1]].taskID;
      if ((matrixRow.length < rowLen) && !isReturnActivity(diagram['tasks'][taskID])) {

        let paddedRow: string[];

        if ((matrixRow.length
            === 1 && diagram.nodes[matrixRow[0]].type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW)) {
          paddedRow = matrixRow;
        } else {
          paddedRow = matrixRow.concat('+'); // append add node symbol
        }

        const rowLenDiff = rowLen - paddedRow.length;
        const paddingArr = _.fill(Array(rowLenDiff), '_');
        outputMatrix.push(paddedRow.concat(<string[]>paddingArr));

      } else {
        // TODO
        // ignore for the moment, assuming that the row won't be overflow
        // and the overflow case should be handled somewhere else.

        outputMatrix.push(matrixRow);
      }
    }
  );

  return outputMatrix;
}

function transformDiagram(diagram: IFlogoFlowDiagram): string[ ][ ] {
  const matrix: string[ ][ ] = [];

  // find the root node
  let root: IFlogoFlowDiagramNode; // diagram node
  if (diagram && diagram.root && diagram.root.is) {
    root = diagram.nodes[diagram.root.is];
  }

  // if there is no root, then it's an empty diagram
  if (!root) {
    return matrix;
  }

  // add the root to the first row of the matrix
  matrix.push([root.id]);

  // handling children of root
  _insertChildNodes(matrix, diagram, root);

  console.groupCollapsed('matrix');
  console.log(matrix);
  console.groupEnd();

  return matrix;
}

function _insertChildNodes(matrix: string[ ][ ],
                           diagram: IFlogoFlowDiagram,
                           node: IFlogoFlowDiagramNode): string[ ][ ] {

  // deep-first traversal

  const curRowIdx = matrix.length - 1;

  if (node.children.length) {
    // make sure the non-branch/non-link node is the first children of the node
    node.children.sort((nodeAID: string, nodeBID: string) => {
      if (diagram.nodes[nodeAID].type === diagram.nodes[nodeBID].type) {
        return 0;
      } else if (diagram.nodes[nodeAID].type
        === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH
        || diagram.nodes[nodeAID].type
        === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_LINK) {
        return 1;
      } else {
        return -1;
      }
    });

    _.each(node.children, (nodeID: string) => {
      if (diagram.nodes[nodeID].type !== FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH) {
        // push to the current row if it's non-branch node
        matrix[curRowIdx].push(nodeID);
      } else {
        // create new row for branch node
        const newRow = Array(matrix[curRowIdx].indexOf(node.id));
        newRow.push(nodeID);
        matrix.push(newRow);
      }

      // not follow the children of a link node
      if (diagram.nodes[nodeID].type !== FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_LINK) {
        _insertChildNodes(matrix, diagram, diagram.nodes[nodeID]);
      }

    });
  }

  return matrix;
}

function filterOverflowAddNode(
  matrix: string[][],
  nodes: IFlogoFlowDiagramNodeDictionary,
  rowLen: number
): string[][] {
  const outputMatrix = _.cloneDeep(matrix);

  _.each(
    outputMatrix, (matrixRow: string[]) => {

      if (matrixRow.length > rowLen) {

        let diffRowLen = matrixRow.length - rowLen;
        while (diffRowLen) {
          const node = nodes[matrixRow[matrixRow.length - 1]];

          if (node && (
              node.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD ||
              node.type === FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW
            )) {
            matrixRow.pop();
          }

          diffRowLen--;
        }

      }

    }
  );


  return outputMatrix;
}
