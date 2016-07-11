"use strict";
exports.PUB_EVENTS = {
    selectTask: {
        channel: 'flogo-flows-detail-tasks',
        topic: 'select-task'
    }
};
exports.SUB_EVENTS = {
    selectTask: {
        channel: 'flogo-flows-detail-tasks',
        topic: 'public-select-task'
    }
};
