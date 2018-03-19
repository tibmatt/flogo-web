import _ from 'lodash';

import { config, flowExport } from '../../config/app-config';

import { TriggerManager } from '../../modules/triggers';
import { ActivitiesManager } from '../../modules/activities';
import { FlowsManager } from '../../modules/flows';
import { ErrorManager } from '../../common/errors';
import { isJSON, retrieveJsonFromRequest } from '../../common/utils';
import { FLOGO_TASK_TYPE, FLOGO_TASK_ATTRIBUTE_TYPE } from '../../common/constants';

import * as flowUtils from './flows.utils';

const basePath = config.app.basePath;

const ERROR_TRIGGER_NOT_FOUND = 'TRIGGER_NOT_FOUND';
const ERROR_ACTIVITY_NOT_FOUND = 'ACTIVITY_NOT_FOUND';
const ERROR_FLOW_NOT_FOUND = 'FLOW_NOT_FOUND';
const ERROR_MISSING_TRIGGER = 'MISSING_TRIGGER';
const ERROR_WRITING_DATABASE = 'ERROR_WRITING_DATABASE';
const ERROR_CODE_BADINPUT = 400;
const ERROR_CODE_SERVERERROR = 500;

export function flows(app, router) {
  if (!app) {
    console.error('[Error][api/activities/index.js]You must pass app');
  }

  router.get(`${basePath}/flows`, getFlows);
  router.post(`${basePath}/flows`, createFlows);
  router.post(`${basePath}/flows/upload`, createFlows);
  router.post(`${basePath}/flows/update`, updateFlows);
  router.del(`${basePath}/flows/:flowId`, deleteFlows);

  router.get(`${basePath}/flows/recent`, getRecentFlows);

  // {
  //   name: 'tibco-mqtt'
  // }
  router.post(`${basePath}/flows/triggers`, addTrigger);
  router.post(`${basePath}/flows/activities`, addActivity);

  router.get(`${basePath}/flows/:flowId/json`, exportFlowInJsonById);
  router.get(`${basePath}/flows/:flowId`, getFlow);
}


/**
 * @swagger
 *  /flows:
 *    get:
 *      tags:
 *        - Flow
 *      summary: Get all the flows information.
 *      responses:
 *        200:
 *          description: 'Flows' information obtained successfully.'
 *          schema:
 *            type: array
 *            items:
 *              $ref: '#/definitions/Full-Flow'
 */
function* getFlows(next) {
  const searchTerms = this.query;
  this.body = yield FlowsManager.find(searchTerms, { fields: 'raw', withApps: true });
}

/**
 * @swagger
 *  /flows/upload:
 *    post:
 *      tags:
 *        - Flow
 *      consumes:
 *        - multipart/form-data
 *      summary: Create a new flow by importing the data from a file.
 *      parameters:
 *        - name: Flow
 *          in: formData
 *          required: false
 *          description: The flow has to be uploaded as a file
 *          type: file
 *      responses:
 *        '200':
 *          description: Flow added successfully.
 *          schema:
 *            type: object
 *            properties:
 *              ok:
 *                type: boolean
 *              id:
 *                type: string
 *                description: The new flow's ID
 *              rev:
 *                type: string
 */
function* createFlows(next) {
  console.log('createFlows');
  try {
    const data = retrieveFlowDataFromRequest(this);
    this.body = yield FlowsManager.createRaw(data);

    if (this.body && this.body.status) {
      this.response.status = this.body.status;
    }
  } catch (err) {
    console.error(err);
    this.status = 400;
    this.body = err;
  }
}

/**
 * @swagger
 *  /flows:
 *    post:
 *      tags:
 *        - Flow
 *      consumes:
 *        - application/json
 *      summary: Create or import a new flow.
 *      parameters:
 *        - name: New Flow
 *          in: body
 *          required: false
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              description:
 *                type: string
 *        - name: Flow
 *          in: formData
 *          required: false
 *          description: The flow has to be uploaded as a file
 *          type: file
 *      responses:
 *        '200':
 *          description: Flow added successfully.
 *          schema:
 *            type: object
 *            properties:
 *              ok:
 *                type: boolean
 *              id:
 *                type: string
 *                description: The new flow's ID
 *              rev:
 *                type: string
 */
function* getRecentFlows() {
  const limit = this.query.limit || 10;
  const foundApps = yield FlowsManager.findRecent({ limit });
  this.body = {
    data: foundApps || [],
  };
}


/**
 * @swagger
 *  /flows/triggers:
 *    post:
 *      tags:
 *        - Trigger
 *        - Flow
 *      summary: Add a new trigger to the flow
 *      parameters:
 *        - name: New trigger
 *          in: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: Trigger name
 *              flowId:
 *                type: string
 *                description: Flow's ID
 *      responses:
 *        '200':
 *          description: Trigger added successfully.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: number
 *                default: 200
 *              id:
 *                type: string
 *                description: Flow's ID
 *              name:
 *                type: string
 *                description: Flow's name
 */
/**
 * @deprecated
 * @param next
 */
function* addTrigger(next) {
  let response = {};
  // TODO validate this query is json
  var params = _.assign({}, { name: '', flowId: '' }, this.request.body || {}, this.query);

  let trigger = yield _getTriggerByName(params.name);
  if (!trigger) {
    this.throw(ERROR_CODE_BADINPUT, ERROR_TRIGGER_NOT_FOUND, {
      details: {
        type: ERROR_TRIGGER_NOT_FOUND,
        message: ERROR_TRIGGER_NOT_FOUND
      },
    });
  }

  let flow = yield FlowsManager.findOne(params.flowId, { fields: 'raw' });
  if (!flow) {
    this.throw(ERROR_CODE_BADINPUT, ERROR_FLOW_NOT_FOUND, {
      details: {
        type: ERROR_FLOW_NOT_FOUND,
        message: ERROR_FLOW_NOT_FOUND,
      },
    });
  }

  trigger = _activitySchemaToTrigger(trigger.schema);
  flow = flowUtils.addTriggerToFlow(flow, trigger);

  let res = yield FlowsManager.updateRaw(flow);

  if (res && res.ok && res.ok == true) {
    response.status = 200;
    response.id = res.id;
    response.name = flow.name || '';
  } else {
    this.throw(ERROR_CODE_SERVERERROR, ERROR_WRITING_DATABASE, {
      details: {
        type: ERROR_WRITING_DATABASE,
        message: ERROR_WRITING_DATABASE
      }
    });
  }

  this.body = response;
}

/**
 * @swagger
 *  /flows/activities:
 *    post:
 *      tags:
 *        - Flow
 *        - Activity
 *      summary: Add a new activity to an specific flow.
 *      parameters:
 *        - name: New Activity
 *          in: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: New activity's name
 *              flowId:
 *                type: string
 *                description: Flow's ID
 *      responses:
 *        '200':
 *          description: Activity added successfully.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: number
 *                default: 200
 *              id:
 *                type: string
 *                description: Flow's ID
 *              name:
 *                type: string
 *                description: Flow's name
 */
/**
 * @deprecated
 * @param next
 */
function* addActivity(next) {
  let response = {};
  var params = _.assign({}, { name: '', flowId: '' }, this.request.body || {}, this.query);

  let activity = yield _getActivityByName(params.name);
  if (!activity) {
    this.throw(ERROR_CODE_BADINPUT, ERROR_ACTIVITY_NOT_FOUND, {
      details: {
        type: ERROR_ACTIVITY_NOT_FOUND,
        message: ERROR_ACTIVITY_NOT_FOUND
      }
    });
  };

  let flow = yield FlowsManager.findOne(params.flowId, { fields: 'raw' });
  if (!flow) {
    this.throw(ERROR_CODE_BADINPUT, ERROR_FLOW_NOT_FOUND, {
      details: {
        type: ERROR_FLOW_NOT_FOUND,
        message: ERROR_FLOW_NOT_FOUND,
      },
    });
  }


  activity = _activitySchemaToTask(activity.schema);
  if (!flowUtils.findNodeNotChildren(flow)) {
    this.throw(ERROR_CODE_BADINPUT, ERROR_MISSING_TRIGGER, {
      details: {
        type: ERROR_MISSING_TRIGGER,
        message: ERROR_MISSING_TRIGGER
      }
    });
  }
  flow = flowUtils.addActivityToFlow(flow, activity);

  let res = yield FlowsManager.updateRaw(flow);

  if (res && res.ok && res.ok == true) {
    response.status = 200;
    response.id = res.id;
    response.name = flow.name || '';
  } else {
    this.throw(ERROR_CODE_SERVERERROR, ERROR_WRITING_DATABASE, {
      details: {
        type: ERROR_WRITING_DATABASE,
        message: ERROR_WRITING_DATABASE,
      },
    });
  }

  this.body = response;
  yield next;
}

/**
 * @swagger
 *  /flows/{flowId}/json:
 *    get:
 *      tags:
 *        - Flow
 *      summary: Obtain the information of a specific Flow in JSON format
 *      parameters:
 *        - name: flowId
 *          in: path
 *          required: true
 *          type: string
 *      responses:
 *        200:
 *          description: Flow information obtained successfully
 *          schema:
 *            $ref: '#/definitions/Flow'
 */
function* exportFlowInJsonById(next) {
  console.log('[INFO] Export flow in JSON by ID');

  let flowId = _.get(this, 'params.flowId');
  let errMsg = {
    'INVALID_PARAMS': 'Invalid flow id.',
    'FLOW_NOT_FOUND': 'Cannot find flow [___FLOW_ID___].'
  };
  let filename = flowExport.filename || 'export.json';

  if (_.isUndefined(flowId)) {

    // invalid parameters
    this.throw(400, errMsg.INVALID_PARAMS);

  } else {

    let flowInfo = yield FlowsManager.findOne(flowId, { fields: 'raw' });

    if (_.isNil(flowInfo) || _.isObject(flowInfo) && _.isEmpty(flowInfo)) {

      // cannot find the flow
      this.throw(404, errMsg.FLOW_NOT_FOUND.replace('___FLOW_ID___', flowId));

    } else {

      // export the flow information as a JSON file
      this.type = 'application/json;charset=UTF-8';
      this.attachment(filename);

      // processing the flow information to omit unwanted fields
      this.body = _.omitBy(flowInfo, (propVal, propName) => {

        if (['_conflicts', 'updatedAt', 'createdAt', 'appId'].indexOf(propName) !== -1) {
          return true;
        }

        // remove the `__status` attribute from `paths.nodes`
        if (propName === 'paths') {
          let nodes = _.get(propVal, 'nodes', {});

          if (!_.isEmpty(nodes)) {
            _.forIn(nodes, (n) => {
              _.unset(n, '__status');
            });
          }
        }

        // remove the `__status` and `__props` attributes from `items`
        if (propName === 'items') {

          if (!_.isEmpty(propVal)) {
            _.forIn(propVal, (item) => {
              _.each(['__status', '__props'], (path) => {
                // If is not trigger, remove __props
                if (item.type !== FLOGO_TASK_TYPE.TASK_ROOT) {
                  _.unset(item, path);
                }
              });
            });
          }

        }

        return false;
      });
    }
  }

  yield next;
}

/**
 * @swagger
 * definition:
 *  Full-Flow:
 *    type: object
 *    properties:
 *      name:
 *        type: string
 *      description:
 *        type: string
 *      paths:
 *        type: object
 *        properties:
 *          root:
 *            type: object
 *            properties:
 *              is:
 *                type: string
 *          nodes:
 *            type: object
 *      items:
 *        type: object
 *      $table:
 *        type: string
 *      errorHandler:
 *        type: object
 *        properties:
 *          paths:
 *            type: object
 *            properties:
 *              root:
 *                type: object
 *                properties:
 *                  is:
 *                    type: string
 *          items:
 *            type: object
 *      createdAt:
 *        type: string
 *        format: dateTime
 *      updatedAt:
 *        type: string
 *        format: dateTime
 *      _id:
 *        type: string
 *      _rev:
 *        type: string
 */

function* getFlow() {
  const flowId = this.params.flowId;

  const flow = yield FlowsManager.findOne(flowId, { fields: 'raw', withApp: true });
  if (!flow) {
    throw ErrorManager.createRestNotFoundError('Flow not found', {
      title: 'Flow not found',
      detail: 'No flow with the specified id',
    });
  }

  this.body = {
    data: flow,
  };
}

function retrieveFlowDataFromRequest(ctx) {
  let data = retrieveJsonFromRequest(ctx);
  let params = ctx.query || {};

  if (params.name) {
    data.name = params.name.trim();
  }
  if (params.appId) {
    data.appId = params.appId;
  }

  return data;
}

/**
 * @swagger
 * /flows/update:
 *    post:
 *      tags:
 *        - Flow
 *      summary: Update a flow
 *      parameters:
 *        - name: Updated flow
 *          description: Updated flow with the same ID and REV value as the one to be updated.
 *          in: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              flow:
 *                $ref: '#/definitions/Full-Flow'
 *      responses:
 *        200:
 *          description: Flow updated successfully
 */
function* updateFlows(next) {
  console.log('[INFO] Updating a flow');
  let data = this.request.body || {};
  if (typeof this.request.body === 'string' && isJSON(this.request.body)) {
    data = JSON.parse(this.request.body);
  }

  this.body = yield FlowsManager.updateRaw(data);
}

/**
 * @swagger
 *  /flows/{flowId}:
 *    delete:
 *      tags:
 *        - Flow
 *      summary: Delete a flow.
 *      parameters:
 *        - name: flowId
 *          in: path
 *          required: true
 *          type: string
 *          description: ID of the flow to be deleted.
 *      responses:
 *        '204':
 *          description: Flow deleted successfully
 *          schema:
 *            type: object
 */
function* deleteFlows(next) {
  const flowId = this.params.flowId;
  const flow = yield FlowsManager.remove(flowId);

  if (!flow) {
    throw ErrorManager.createRestNotFoundError('Flow not found', {
      title: 'Flow not found',
      detail: 'No flow with the specified id',
    });
  }
  this.status = 204;
}

/**
 * @swagger
 * definition:
 *  Flow:
 *    type: object
 *    properties:
 *      name:
 *        type: string
 *      description:
 *        type: string
 *      paths:
 *        type: object
 *        properties:
 *          root:
 *            type: object
 *            properties:
 *              is:
 *                type: string
 *          nodes:
 *            type: object
 *      items:
 *        type: object
 *      $table:
 *        type: string
 *      errorHandler:
 *        type: object
 *        properties:
 *          paths:
 *            type: object
 *            properties:
 *              root:
 *                type: object
 *                properties:
 *                  is:
 *                    type: string
 *          items:
 *            type: object
 */

/**
 *
 * @param triggerName: string
 * @returns {*}
 */
function _getTriggerByName(triggerName) {
  return TriggerManager.find({ name: triggerName })
    .then(triggers => triggers[0]);
}


/**
 *
 * @param activityName: string
 * @returns {*}
 */
function _getActivityByName(activityName) {
  return ActivitiesManager.find({ name: activityName })
    .then(activities => activities[0]);
}


function _activitySchemaToTrigger(schema) {
  let trigger = {
    type: FLOGO_TASK_TYPE.TASK_ROOT,
    triggerType: _.get(schema, 'name', ''),
    name: _.get(schema, 'name', ''),
    version: _.get(schema, 'version', ''),
    title: _.get(schema, 'title', ''),
    description: _.get(schema, 'description', ''),
    settings: _.get(schema, 'settings', ''),
    outputs: _.get(schema, 'outputs', ''),
    endpoint: { settings: _.get(schema, 'endpoint.settings', '') }
  };

  _.each(
    trigger.outputs, (output) => {
      // convert to task enumeration and provision default types
      _.assign(output, portAttribute(output));
    }
  );

  return trigger;
}

function _isRequiredConfiguration(schema) {
  var inputs = _.get(schema, 'inputs', []);
  var index = _.findIndex(inputs, function (input) {
    return input.required == true;
  });

  return (index !== -1);
}

// mapping from schema.json of activity to the task can be used in flow.json
function _activitySchemaToTask(schema) {

  let task = {
    type: FLOGO_TASK_TYPE.TASK,
    activityType: _.get(schema, 'name', ''),
    name: _.get(schema, 'title', _.get(schema, 'name', 'Activity')),
    version: _.get(schema, 'version', ''),
    title: _.get(schema, 'title', ''),
    description: _.get(schema, 'description', ''),
    attributes: {
      inputs: _.get(schema, 'inputs', []),
      outputs: _.get(schema, 'outputs', [])
    },
    __props: {
      warnings: []
    }
  };

  if (_isRequiredConfiguration(schema)) {
    task.__props.warnings.push({ msg: 'Configure Required' });
  }

  _.each(
    task.attributes.inputs, (input) => {
      // convert to task enumeration and provision default types
      _.assign(input, portAttribute(input, true));
    }
  );

  _.each(
    task.attributes.outputs, (output) => {
      // convert to task enumeration and provision default types
      _.assign(output, portAttribute(output));
    }
  );

  return task;
}

function portAttribute(inAttr, withDefault) {
  if (withDefault === void 0) {
    withDefault = false;
  }
  var outAttr = _.assign({}, inAttr);

  outAttr.type = FLOGO_TASK_ATTRIBUTE_TYPE[_.get(outAttr, 'type', 'String').toUpperCase()];

  if (withDefault && _.isUndefined(outAttr.value)) {
    outAttr.value = getDefaultValue(outAttr.type);
  }
  return outAttr;
}

// get default value of a given type
function getDefaultValue(type) {
  let defaultValues = [];

  defaultValues[FLOGO_TASK_ATTRIBUTE_TYPE.STRING] = '';
  defaultValues[FLOGO_TASK_ATTRIBUTE_TYPE.INTEGER] = 0;
  defaultValues[FLOGO_TASK_ATTRIBUTE_TYPE.LONG] = 0;
  defaultValues[FLOGO_TASK_ATTRIBUTE_TYPE.DOUBLE] = 0.0;
  defaultValues[FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN] = false;
  defaultValues[FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT] = null;
  defaultValues[FLOGO_TASK_ATTRIBUTE_TYPE.ARRAY] = [];
  defaultValues[FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS] = null;

  return defaultValues[type];
}

