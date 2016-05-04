'use strict';

require('./config');

if (!process.env['SLACK_API_TOKEN']) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

let botkit = require('botkit');

let controller = botkit.slackbot({
  debug: true
});

let botInstance = controller.spawn({
  token: process.env['SLACK_API_TOKEN']
});

if(!process.env.BOT_STATUS || process.env.BOT_STATUS.toLowerCase() != 'off') {
  botInstance.startRTM();
  require('./bot')(controller);
}

if(!process.env.COMMANDER_STATUS || process.env.COMMANDER_STATUS.toLowerCase() != 'off') {

  botInstance.api.team.info({}, (err, res) => {
    controller.saveTeam(res.team, (err, res) => {
      if(err) {
        console.log('Could not configure team');
      } else {
        console.log('Team configured');
      }
    });
  });

  require('./commander')(controller);
}
