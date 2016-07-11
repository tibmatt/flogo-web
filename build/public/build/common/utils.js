"use strict";
var constants_1 = require('./constants');
var models_1 = require('../app/flogo.flows.detail.diagram/models');
function flogoIDEncode(id) {
    return btoa(id)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
exports.flogoIDEncode = flogoIDEncode;
function flogoIDDecode(encodedId) {
    encodedId = encodedId.replace(/-/g, '+')
        .replace(/_/g, '/');
    while (encodedId.length % 4) {
        encodedId += '=';
    }
    return atob(encodedId);
}
exports.flogoIDDecode = flogoIDDecode;
function flogoGenTaskID(items) {
    var taskID;
    if (items) {
        var ids = _.keys(items);
        var startPoint = 2;
        var taskIDs = _.map(_.filter(ids, function (id) {
            return items[id].type === constants_1.FLOGO_TASK_TYPE.TASK;
        }), function (id) {
            return _['toNumber'](flogoIDDecode(id));
        });
        var currentMax = _.max(taskIDs);
        if (currentMax) {
            taskID = '' + (currentMax + 1);
        }
        else {
            taskID = '' + startPoint;
        }
    }
    else {
        taskID = '' + (Date.now() >>> 1);
    }
    return flogoIDEncode(taskID);
}
exports.flogoGenTaskID = flogoGenTaskID;
function flogoGenBranchID() {
    return flogoIDEncode("Flogo::Branch::" + Date.now());
}
exports.flogoGenBranchID = flogoGenBranchID;
function flogoGenTriggerID() {
    return flogoIDEncode("Flogo::Trigger::" + Date.now());
}
exports.flogoGenTriggerID = flogoGenTriggerID;
function convertTaskID(taskID) {
    var id = '';
    try {
        id = flogoIDDecode(taskID);
        var parsedID = id.split('::');
        if (parsedID.length >= 2) {
            id = parsedID[1];
        }
    }
    catch (e) {
        console.warn(e);
        id = taskID;
    }
    return parseInt(id);
}
exports.convertTaskID = convertTaskID;
function getDefaultValue(type) {
    return constants_1.DEFAULT_VALUES_OF_TYPES[type];
}
exports.getDefaultValue = getDefaultValue;
function portAttribute(inAttr, withDefault) {
    if (withDefault === void 0) { withDefault = false; }
    var outAttr = _.assign({}, inAttr);
    outAttr.type = _.get(constants_1.FLOGO_TASK_ATTRIBUTE_TYPE, _.get(outAttr, 'type', 'STRING')
        .toUpperCase());
    if (withDefault && _.isUndefined(outAttr.value)) {
        outAttr.value = getDefaultValue(outAttr.type);
    }
    return outAttr;
}
function activitySchemaToTask(schema) {
    var task = {
        type: constants_1.FLOGO_TASK_TYPE.TASK,
        activityType: _.get(schema, 'name', ''),
        name: _.get(schema, 'title', _.get(schema, 'name', 'Activity')),
        version: _.get(schema, 'version', ''),
        title: _.get(schema, 'title', ''),
        description: _.get(schema, 'description', ''),
        homepage: _.get(schema, 'homepage', ''),
        attributes: {
            inputs: _.get(schema, 'inputs', []),
            outputs: _.get(schema, 'outputs', [])
        },
        __schema: _.cloneDeep(schema)
    };
    _.each(task.attributes.inputs, function (input) {
        _.assign(input, portAttribute(input, true));
    });
    _.each(task.attributes.outputs, function (output) {
        _.assign(output, portAttribute(output));
    });
    return task;
}
exports.activitySchemaToTask = activitySchemaToTask;
function activitySchemaToTrigger(schema) {
    var trigger = {
        type: constants_1.FLOGO_TASK_TYPE.TASK_ROOT,
        triggerType: _.get(schema, 'name', ''),
        name: _.get(schema, 'title', _.get(schema, 'name', 'Activity')),
        version: _.get(schema, 'version', ''),
        title: _.get(schema, 'title', ''),
        description: _.get(schema, 'description', ''),
        homepage: _.get(schema, 'homepage', ''),
        settings: _.get(schema, 'settings', ''),
        outputs: _.get(schema, 'outputs', ''),
        endpoint: { settings: _.get(schema, 'endpoint.settings', '') },
        __schema: _.cloneDeep(schema)
    };
    _.each(trigger.inputs, function (input) {
        _.assign(input, portAttribute(input, true));
    });
    _.each(trigger.outputs, function (output) {
        _.assign(output, portAttribute(output));
    });
    return trigger;
}
exports.activitySchemaToTrigger = activitySchemaToTrigger;
function genBranchArrow(opts) {
    var svgSize = [
        _.get(opts, 'svgWidth', 87),
        _.get(opts, 'svgHeight', 100)
    ];
    var barWidth = _.get(opts, 'barSize', 26);
    var translateCo = _.get(opts, 'translate', [2, 2]);
    var padding = _.get(opts, 'padding', {
        bottom: 3,
        right: 2
    });
    var imgSize = [
        svgSize[0] - translateCo[0] - padding.right,
        svgSize[1] - translateCo[1] - padding.bottom
    ];
    var triangleHeightFactor = 7 / 12.5;
    var halfBaseline = barWidth / 2;
    var heightOfTriangle = halfBaseline * triangleHeightFactor;
    var outerCurveFactor = barWidth / 26;
    var curveBarAreaOffset = {
        width: 8 * outerCurveFactor,
        height: 7 * outerCurveFactor,
        outerCurveHeight: 9 * outerCurveFactor,
        outerCurveWdith: 10 * outerCurveFactor,
        outerCurCtrl1X: 0.00407789085 * outerCurveFactor,
        outerCurCtrl1Y: 13.2639443 * outerCurveFactor,
        outerCurCtrl2X: 13.2532577 * outerCurveFactor,
        outerCurCtrl2Y: 9.999999974752427e-7 * outerCurveFactor,
        innerCurCtrl1X: 4.022091400000001 * outerCurveFactor,
        innerCurCtrl1Y: 0.3753411 * outerCurveFactor,
        innerCurCtrl2X: 0.4 * outerCurveFactor,
        innerCurCtrl2Y: 4.0465096 * outerCurveFactor
    };
    var curveBarArea = {
        maxWidth: curveBarAreaOffset.width + barWidth,
        maxHeight: curveBarAreaOffset.height + barWidth
    };
    var width = imgSize[0] - heightOfTriangle - curveBarArea.maxWidth;
    var height = imgSize[1] - curveBarArea.maxHeight;
    var leftLine = {
        start: [0, 0],
        stop: [0, curveBarAreaOffset.outerCurveHeight + height]
    };
    var outerCurve = {
        start: leftLine.stop,
        stop: [
            curveBarArea.maxWidth - curveBarAreaOffset.outerCurveWdith,
            curveBarArea.maxHeight + height
        ],
    };
    var outerCurveControl = {
        control1: [
            outerCurve.start[0] + curveBarAreaOffset.outerCurCtrl1X,
            outerCurve.start[1] + curveBarAreaOffset.outerCurCtrl1Y
        ],
        control2: [
            outerCurve.stop[0] - curveBarAreaOffset.outerCurCtrl2X,
            outerCurve.stop[1] - curveBarAreaOffset.outerCurCtrl2Y
        ]
    };
    var bottomHLine = {
        start: outerCurve.stop,
        stop: [curveBarArea.maxWidth + width, outerCurve.stop[1]]
    };
    var topOfArrow = [
        bottomHLine.stop[0] + heightOfTriangle,
        bottomHLine.stop[1] - halfBaseline
    ];
    var middleHLine = {
        start: [bottomHLine.stop[0], bottomHLine.stop[1] - barWidth],
        stop: [curveBarArea.maxWidth, bottomHLine.stop[1] - barWidth]
    };
    var innerCurve = {
        start: middleHLine.stop,
        stop: [barWidth, height]
    };
    var innerCurveControl = {
        control1: [
            innerCurve.start[0] - curveBarAreaOffset.innerCurCtrl1X,
            innerCurve.start[1] - curveBarAreaOffset.innerCurCtrl1Y
        ],
        control2: [
            innerCurve.stop[0] + curveBarAreaOffset.innerCurCtrl2X,
            innerCurve.stop[1] + curveBarAreaOffset.innerCurCtrl2Y
        ]
    };
    return "M" + leftLine.start.join(',') + " L" + leftLine.stop.join(',') + " C" + outerCurveControl.control1.join(',') + " " + outerCurveControl.control2.join(',') + " " + outerCurve.stop.join(',') + " L" + bottomHLine.stop.join(',') + " L" + topOfArrow.join(',') + " L" + middleHLine.start.join(',') + " L" + middleHLine.stop.join(',') + " C" + innerCurveControl.control1.join(',') + " " + innerCurveControl.control2.join(',') + " " + innerCurve.stop.join(',') + " L" + barWidth + ",0 Z";
}
exports.genBranchArrow = genBranchArrow;
function genBranchLine(opts) {
    var svgSize = [
        _.get(opts, 'svgWidth', 92),
        _.get(opts, 'svgHeight', 107)
    ];
    var barWidth = _.get(opts, 'barSize', 26);
    var translate = _.get(opts, 'translate', [2, 2]);
    var SUPPORTED_STATES = ['default', 'hover', 'selected', 'run'];
    var DEFAULT_FILTER = "\n      <filter x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\" filterUnits=\"objectBoundingBox\" id=\"filter-1\">\n          <feOffset dx=\"0\" dy=\"1\" in=\"SourceAlpha\" result=\"shadowOffsetOuter1\"></feOffset>\n          <feGaussianBlur stdDeviation=\"1\" in=\"shadowOffsetOuter1\" result=\"shadowBlurOuter1\"></feGaussianBlur>\n          <feColorMatrix values=\"0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.2 0\" type=\"matrix\" in=\"shadowBlurOuter1\" result=\"shadowMatrixOuter1\"></feColorMatrix>\n          <feMerge>\n              <feMergeNode in=\"shadowMatrixOuter1\"></feMergeNode>\n              <feMergeNode in=\"SourceGraphic\"></feMergeNode>\n          </feMerge>\n      </filter>\n    ".trim();
    var filters = {
        'default': DEFAULT_FILTER,
        'hover': "\n      <filter x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\" filterUnits=\"objectBoundingBox\" id=\"filter-1\">\n          <feOffset dx=\"0\" dy=\"1\" in=\"SourceAlpha\" result=\"shadowOffsetOuter1\"></feOffset>\n          <feGaussianBlur stdDeviation=\"1.5\" in=\"shadowOffsetOuter1\" result=\"shadowBlurOuter1\"></feGaussianBlur>\n          <feColorMatrix values=\"0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.4 0\" in=\"shadowBlurOuter1\" type=\"matrix\" result=\"shadowMatrixOuter1\"></feColorMatrix>\n          <feMerge>\n              <feMergeNode in=\"shadowMatrixOuter1\"></feMergeNode>\n              <feMergeNode in=\"SourceGraphic\"></feMergeNode>\n          </feMerge>\n      </filter>\n    ".trim(),
        'selected': "\n      <filter x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\" filterUnits=\"objectBoundingBox\" id=\"filter-1\">\n          <feOffset dx=\"0\" dy=\"1\" in=\"SourceAlpha\" result=\"shadowOffsetOuter1\"></feOffset>\n          <feGaussianBlur stdDeviation=\"1.5\" in=\"shadowOffsetOuter1\" result=\"shadowBlurOuter1\"></feGaussianBlur>\n          <feColorMatrix values=\"0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.4 0\" in=\"shadowBlurOuter1\" type=\"matrix\" result=\"shadowMatrixOuter1\"></feColorMatrix>\n          <feMerge>\n              <feMergeNode in=\"shadowMatrixOuter1\"></feMergeNode>\n              <feMergeNode in=\"SourceGraphic\"></feMergeNode>\n          </feMerge>\n      </filter>\n    ".trim(),
        'run': DEFAULT_FILTER
    };
    var fills = {
        'default': "\n      <linearGradient x1=\"50%\" y1=\"0%\" x2=\"50%\" y2=\"100%\" id=\"linearGradient-1\">\n          <stop stop-color=\"#ABB0C5\" offset=\"0%\"></stop>\n          <stop stop-color=\"#C2C5DA\" offset=\"100%\"></stop>\n      </linearGradient>\n    ".trim(),
        'hover': "\n      <linearGradient x1=\"50%\" y1=\"0%\" x2=\"50%\" y2=\"100%\" id=\"linearGradient-1\">\n          <stop stop-color=\"#ABB0C5\" offset=\"0%\"></stop>\n          <stop stop-color=\"#C2C5DA\" offset=\"100%\"></stop>\n      </linearGradient>\n    ".trim(),
        'selected': '',
        'run': ''
    };
    var path = genBranchArrow(_.assign({}, opts, {
        svgWidth: svgSize[0],
        svgHeight: svgSize[1],
        barWidth: barWidth,
        translate: translate,
        padding: {
            bottom: 10,
            right: 3
        }
    }));
    var groups = {
        'default': ("\n      <g id=\"branch-1\" filter=\"url(#filter-1)\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" transform=\"translate(" + translate[0] + ", " + translate[1] + ")\">\n          <path d=\"" + path + "\" id=\"Combined-Shape\" fill=\"url(#linearGradient-1)\"></path>\n      </g>\n    ").trim(),
        'hover': ("\n      <g id=\"Spec\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" transform=\"translate(" + translate[0] + ", " + translate[1] + ")\">\n          <g id=\"Flogo_Branch-Configure-1\" fill=\"url(#linearGradient-1)\">\n              <g id=\"branches\">\n                  <g id=\"branch-1\">\n                      <path d=\"" + path + "\" id=\"Combined-Shape\" filter=\"url(#filter-1)\"></path>\n                  </g>\n              </g>\n          </g>\n      </g>\n    ").trim(),
        'selected': ("\n      <g id=\"Spec\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" transform=\"translate(" + translate[0] + ", " + translate[1] + ")\">\n          <g id=\"Flogo_Branch-Configure-1\" fill=\"#8A90AE\">\n              <g id=\"branches\">\n                  <g id=\"branch-1\">\n                      <path d=\"" + path + "\" id=\"Combined-Shape\" filter=\"url(#filter-1)\"></path>\n                  </g>\n              </g>\n          </g>\n      </g>\n    ").trim(),
        'run': ("\n      <g id=\"Spec\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" transform=\"translate(" + translate[0] + ", " + translate[1] + ")\">\n          <g id=\"Flogo_Branch-Configure-1\" fill=\"#DEF2FD\">\n              <g id=\"branches\">\n                  <g id=\"branch-1\">\n                      <path d=\"" + path + "\" id=\"Combined-Shape\" filter=\"url(#filter-1)\"></path>\n                  </g>\n              </g>\n          </g>\n      </g>\n    ").trim()
    };
    var svgWrapper = ("\n  <svg width=\"" + svgSize[0] + "px\" height=\"" + svgSize[1] + "px\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n    <defs>\n        ___FILTER___\n        ___FILL___\n    </defs>\n    ___GROUP___\n  </svg>\n  ").trim();
    var branchLines = {};
    _.each(SUPPORTED_STATES, function (state) {
        branchLines[state] = svgWrapper.replace('___FILTER___', filters[state])
            .replace('___FILL___', fills[state])
            .replace('___GROUP___', groups[state]);
    });
    return branchLines;
}
exports.genBranchLine = genBranchLine;
function normalizeTaskName(taskName) {
    return _.kebabCase(taskName);
}
exports.normalizeTaskName = normalizeTaskName;
function parseMapping(automapping) {
    var matches = constants_1.FLOGO_AUTOMAPPING_FORMAT.exec(automapping);
    if (!matches) {
        return null;
    }
    var taskId = matches[2] || null;
    var attributeName = matches[3];
    var path = matches[4] ? _.trimStart(matches[4], '.') : null;
    return {
        autoMap: "{" + matches[1] + "." + attributeName + "}",
        isRoot: !taskId,
        taskId: taskId,
        attributeName: attributeName,
        path: path
    };
}
exports.parseMapping = parseMapping;
function updateFlogoGlobalConfig(config) {
    window.FLOGO_GLOBAL = config;
    if (localStorage) {
        localStorage.setItem('FLOGO_GLOBAL', JSON.stringify(config));
    }
}
exports.updateFlogoGlobalConfig = updateFlogoGlobalConfig;
function resetFlogoGlobalConfig() {
    updateFlogoGlobalConfig({
        db: {
            port: '5984',
            name: 'flogo-web'
        },
        activities: {
            db: {
                port: '5984',
                name: 'flogo-web-activities'
            }
        },
        triggers: {
            db: {
                port: '5984',
                name: 'flogo-web-triggers'
            },
        },
        engine: {
            port: "8080",
            testPath: "status"
        },
        stateServer: {
            port: "9190",
            testPath: "ping"
        },
        flowServer: {
            port: "9090",
            testPath: "ping"
        }
    });
}
exports.resetFlogoGlobalConfig = resetFlogoGlobalConfig;
function getFlogoGlobalConfig() {
    if (!window.FLOGO_GLOBAL) {
        var config = void 0;
        if (localStorage) {
            config = localStorage.getItem('FLOGO_GLOBAL');
            if (config) {
                try {
                    config = JSON.parse(config);
                }
                catch (e) {
                    console.warn(e);
                }
                updateFlogoGlobalConfig(config);
                return config;
            }
        }
        resetFlogoGlobalConfig();
    }
    return window.FLOGO_GLOBAL;
}
exports.getFlogoGlobalConfig = getFlogoGlobalConfig;
function getURL(config) {
    if (config.port) {
        return (config.protocol || location.protocol.replace(':', '')) + "://" + (config.host || location.hostname) + ":" + config.port;
    }
    else {
        return (config.protocol || location.protocol.replace(':', '')) + "://" + (config.host || location.hostname) + "}";
    }
}
exports.getURL = getURL;
function getEngineURL() {
    return getURL(window.FLOGO_GLOBAL.engine);
}
exports.getEngineURL = getEngineURL;
function getStateServerURL() {
    return getURL(window.FLOGO_GLOBAL.stateServer);
}
exports.getStateServerURL = getStateServerURL;
function getProcessServerURL() {
    return getURL(window.FLOGO_GLOBAL.flowServer);
}
exports.getProcessServerURL = getProcessServerURL;
function getDBURL(dbConfig) {
    return getURL(dbConfig) + "/" + dbConfig.name;
}
exports.getDBURL = getDBURL;
function copyToClipboard(element) {
    var sel = window.getSelection();
    var snipRange = document.createRange();
    snipRange.selectNodeContents(element);
    sel.removeAllRanges();
    sel.addRange(snipRange);
    var res = false;
    try {
        res = document.execCommand('copy');
    }
    catch (err) {
        console.error(err);
    }
    sel.removeAllRanges();
    return res;
}
exports.copyToClipboard = copyToClipboard;
function notification(message, type, time, settings) {
    var styles = '';
    for (var key in settings) {
        styles += key + ':' + settings[key] + ';';
    }
    var template = "<div style=\"" + styles + "\" class=\"" + type + " flogo-common-notification\">" + message;
    if (!time) {
        template += "\n    <i class=\"fa fa-times flogo-common-notification-close\"></i>\n    ";
    }
    template += '</div>';
    var notificationContainer = jQuery('body > .flogo-common-notification-container');
    if (notificationContainer.length) {
        notificationContainer.append(template);
    }
    else {
        jQuery('body').append("<div class=\"flogo-common-notification-container\">" + template + "</div>");
    }
    var notification = jQuery('.flogo-common-notification-container>div:last');
    var notifications = jQuery('.flogo-common-notification-container>div');
    var maxCounter = 5;
    if (notifications.length > 5) {
        for (var i = 0; i < notifications.length - maxCounter; i++) {
            if (notifications[i])
                notifications[i].remove();
        }
    }
    setTimeout(function () {
        notification.addClass('on');
    }, 100);
    return new Promise(function (resolve, reject) {
        if (time) {
            setTimeout(function () {
                if (notification)
                    notification.remove();
                if (!notificationContainer.html())
                    notificationContainer.remove();
            }, time);
        }
        if (!time) {
            notification.find('.flogo-common-notification-close').click(function () {
                notification.remove();
                resolve();
            });
        }
        else {
            resolve();
        }
    });
}
exports.notification = notification;
function attributeTypeToString(inType) {
    if (_.isString(inType)) {
        return inType;
    }
    return (constants_1.FLOGO_TASK_ATTRIBUTE_TYPE[inType] || 'string').toLowerCase();
}
exports.attributeTypeToString = attributeTypeToString;
function updateBranchNodesRunStatus(nodes, tasks) {
    _.forIn(nodes, function (node) {
        var task = tasks[node.taskID];
        if (task.type === constants_1.FLOGO_TASK_TYPE.TASK_BRANCH) {
            _.set(task, '__status.hasRun', models_1.FlogoFlowDiagram.hasBranchRun(node, tasks, nodes));
        }
    });
}
exports.updateBranchNodesRunStatus = updateBranchNodesRunStatus;
