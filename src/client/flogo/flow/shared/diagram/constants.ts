/**
 * Enumerations
 */

export enum FLOGO_FLOW_DIAGRAM_NODE_TYPE {
  NODE_PADDING,   // padding node
  NODE_HOLDER,    // placeholder node
  NODE_ADD,       // node to add an activity
  NODE_ROOT,      // the trigger node
  NODE_ROOT_NEW,  // node to add a trigger
  NODE,           // activity node
  NODE_BRANCH,    // the branch line node
  NODE_LINK,      // the link node
  NODE_SUB_PROC,  // activity with sub flow
  NODE_LOOP,       // repeatable activity
  NODE_ROOT_ERROR_NEW
}

// types of link in `flow.json`
export enum FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE {
  DEFAULT,
  BRANCH,
  LABELED
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
