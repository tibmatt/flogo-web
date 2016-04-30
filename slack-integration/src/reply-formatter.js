'use strict';

module.exports = {
  formatFlow,
  formatFlowList
};

function formatFlow(flow) {
  // TODO extract server info as env/config vars
  // TODO maybe url should already come in flow data
  let url = 'http://localhost:3010/flows/' + flow.id;

  return {
    attachments: [
      {
        fallback: url,
        title: flow.name,
        title_link: url,
        text: `Created on ${flow.created}`,
        color: '#28D7E5'
      }
    ]
  };

}

function formatFlowList(flows) {
  return 'These are the existing flows:\n'
    + (flows || []).map((flow, index) => `${index + 1}. ${flow.name}`).join('\n');
}
