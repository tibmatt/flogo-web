"use strict";
exports.PUB_EVENTS = {
    addTask: {
        channel: 'flogo-flows-detail-tasks',
        topic: 'add-task'
    }
};
exports.SUB_EVENTS = {
    addTask: {
        channel: 'flogo-flows-detail-tasks',
        topic: 'public-add-task'
    },
    installActivity: {
        channel: 'flogo-flows-detail-tasks',
        topic: 'public-install-activity'
    }
};
