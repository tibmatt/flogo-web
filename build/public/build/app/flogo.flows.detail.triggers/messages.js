"use strict";
exports.PUB_EVENTS = {
    addTrigger: {
        channel: 'flogo-flows-detail-triggers',
        topic: 'add-trigger'
    },
    selectTrigger: {
        channel: 'flogo-flows-detail-triggers',
        topic: 'select-trigger'
    }
};
exports.SUB_EVENTS = {
    addTrigger: {
        channel: 'flogo-flows-detail-triggers',
        topic: 'public-add-trigger'
    },
    selectTrigger: {
        channel: 'flogo-flows-detail-triggers',
        topic: 'public-select-trigger'
    },
    installTrigger: {
        channel: 'flogo-flows-detail-triggers',
        topic: 'public-install-trigger'
    }
};
