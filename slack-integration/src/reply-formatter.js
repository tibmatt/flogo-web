'use strict';

module.exports = {
  formatFlow,
  formatFlowList
};

function formatFlow(flow, msg) {
  let pretext = msg ? msg : undefined;

  // TODO extract server info as env/config vars
  // TODO maybe url should already come in flow data
  let url = 'http://localhost:3010/flows/' + flow.id;
  let text = flow.name;
  if(flow.description) {
    text = flow.description;
  } else if (flow.created) {
    text = `Created on ${flow.created}`;
  }

  return {
    attachments: [
      {
        pretext,
        fallback: url,
        title: flow.name,
        title_link: url,
        text,
        color: '#28D7E5'
      }
    ]
  };

}

function formatFlowList(flows) {
  return 'These are the existing flows:\n'
    + (flows || []).map((flow, index) => `${index + 1}. ${flow.name}`).join('\n');
}
