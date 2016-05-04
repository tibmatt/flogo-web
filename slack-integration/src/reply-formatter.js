'use strict';

module.exports = {
  formatFlow,
  formatFlowList
};

function formatFlow(flow, msg) {
  let pretext = msg ? msg : undefined;

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
        fallback: flow.url,
        title: flow.name,
        title_link: flow.url,
        text,
        color: '#28D7E5'
      }
    ]
  };

}

function formatFlowList(flows, msg) {
  let pretext = msg ? msg : undefined;
  let flowList = (flows || []).map((flow, index) => `${index + 1}. <${flow.url}|${flow.name}>`).join('\n');

  return {
    attachments: [
      {
        pretext,
        title: 'Flows',
        text: flowList,
        mrkdwn_in: ['text', 'pretext']
      }
    ]
  };

}
