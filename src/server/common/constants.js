export const FLOGO_FLOW_DIAGRAM_NODE_TYPE  = {
    NODE_PADDING:0,   // padding node
    NODE_HOLDER:1,    // placeholder node
    NODE_ADD:2,       // node to add an activity
    NODE_ROOT:3,      // the trigger node
    NODE_ROOT_NEW:4,  // node to add a trigger
    NODE:5,           // activity node
    NODE_BRANCH:6,    // the branch line node
    NODE_LINK:7,      // the link node
    NODE_SUB_PROC:8,  // activity with sub flow
    NODE_LOOP:9       // repeatable activity
};

export const FLOGO_TASK_TYPE = {
  TASK_ROOT:0,
  TASK:1,
  TASK_BRANCH:2,
  TASK_SUB_PROC:3,
  TASK_LOOP:4
};
