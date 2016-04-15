/**
 * Enumerations
 */

export enum FLOGO_FLOW_DIAGRAM_NODE_TYPE {
  NODE_PADDING, // padding node
  NODE_HOLDER,  // placeholder node
  NODE_ADD,
  NODE_ROOT,
  NODE_ROOT_NEW,
  NODE,
  NODE_BRANCH,
  NODE_LINK,
  NODE_SUB_PROC,
  NODE_LOOP
}

export enum FLOGO_FLOW_DIAGRAM_NODE_MENU_ITEM_TYPE {
  ADD_BRANCH,
  SELECT_TRANSFORM,
  DELETE
}

/**
 * Constants
 */


/**
 * Debugging switch
 */
export const FLOGO_FLOW_DIAGRAM_DEBUG = true;
export const FLOGO_FLOW_DIAGRAM_VERBOSE = FLOGO_FLOW_DIAGRAM_DEBUG && false;
