"use strict";
var utils_1 = require('../../../common/utils');
var FlogoFlowDiagramTaskLink = (function () {
    function FlogoFlowDiagramTaskLink() {
    }
    FlogoFlowDiagramTaskLink.genTaskLinkID = function () {
        return utils_1.flogoIDEncode('FlogoFlowDiagramTaskLink::' + Date.now());
    };
    ;
    return FlogoFlowDiagramTaskLink;
}());
exports.FlogoFlowDiagramTaskLink = FlogoFlowDiagramTaskLink;
