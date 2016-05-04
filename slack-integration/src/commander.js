'use strict';

let flogo = require('./flogo');
var formatter = require('./reply-formatter');

const SLASH_COMMANDS = {
  MAIN: '/flogo',
  CREATE: '/flogo-create',
  ADD: '/flogo-add',
  SHOW: '/flogo-show',
  LIST_ACTIVITIES: '/flogo-show-activities',
  LIST_TRIGGERS: '/flogo-show-triggers'
};

const COMMANDS = {
  create: SLASH_COMMANDS.CREATE,
  add: SLASH_COMMANDS.ADD,
  show: SLASH_COMMANDS.SHOW
};

module.exports = function (controller) {

  controller.setupWebserver(process.env.PORT, function(err,webserver) {

    controller.createWebhookEndpoints(controller.webserver);

  });

  controller.on('slash_command', function(bot, message) {
    let slashCommand = message.command;
    if(!_isKnownSlashCommand(slashCommand)) {
      return; // ignore it
    }

    let params = (message.text || '').split(/[\s,]+/);
    if(slashCommand == SLASH_COMMANDS.MAIN) {
      if(COMMANDS[params[0]]) {
        slashCommand = COMMANDS[params[0]];
        params.shift();
      } else {
        return _showHelp(bot, message);
      }
    }

    switch (slashCommand) {
      case SLASH_COMMANDS.CREATE:
        _createFlow(bot, message, params);
        break;
      case SLASH_COMMANDS.ADD:
        _addTile(bot, message, params);
        break;
      case SLASH_COMMANDS.SHOW:
        _show(bot, message, params);
        break;
      case SLASH_COMMANDS.LIST_ACTIVITIES:
        _list('activities', bot, message, params);
        break;
      case SLASH_COMMANDS.LIST_TRIGGERS:
        _list('triggers', bot, message, params);
        break;
    }

  });

};

function _showHelp(bot, message) {
  bot.replyPrivate(message, `Available commands:
  • \`/flogo help\` - show this help
  • \`/flogo-create [name of your flow]\` - create a new flow
  • \`/flogo-add trigger [name-of-the-trigger]\` - add a trigger to the current flow
  • \`/flogo-add activity [name-of-the-activity]\` - add an activity to the current flow
  • \`/flogo-show\` - list all flows
  • \`/flogo-show [flow name]\` - find a flow by name
  • \`/flogo-show-triggers\` - list all triggers
  • \`/flogo-show-activities\` - list all activities
  `);
}

function _createFlow(bot, message, params){
  if(params && params.length > 0) {
    let flowName = params.join(' ');
    flogo.create(flowName)
      .then(flowInfo => bot.replyPublic(message, formatter.formatFlow(flowInfo, `Successfully created flow "${flowName}"`)))
      .catch(err => {
        console.error(err);
        if (err.code && err.code == flogo.ERRORS.ALREADY_EXISTS) {
          bot.replyPrivate(message, 'There\'s already a flow with that name. You may want to chose another name.');
        } else {
          bot.replyPrivate(message, 'Oh no, something wen\'t wrong');
        }
      });
  } else {
    bot.replyPrivate(message, 'You\'re missing the name of your flow\nUse /flogo-create [name of your flow]');
  }
}

function _addTile(bot, message, params) {
  var entity = (params[0] ||'').toLowerCase();

  if(!entity) {
    return bot.replyPrivate(message, "Use `/flogo-add [activity|trigger] [name-of-the-activity-or-trigger]`");
  }

  if (entity != 'trigger' && entity != 'activity') {
    return bot.replyPrivate(message, 'I can only add activities and triggers');
  }

  var entityName = params[1];
  if (!entityName) {
    return bot.replyPrivate(message, `Add what? Use: /flogo-add ${entity} [name-of-the-${entity}]`);
  }

  var isTrigger = entity == 'trigger';
  var promise = null;
  if (isTrigger) {
    promise = flogo.addTrigger(entityName);
  } else {
    promise = flogo.addActivity(entityName);
  }

  promise
    .then(res => bot.replyPublic(message, `Added ${entity} "${entityName}" to flow "${res.flowName}"`))
    .catch(err => {
      var msg = 'Oh no, something wen\'t wrong';
      if (err && err.code) {
        if (err.code == flogo.ERRORS.NO_FLOW) {
          msg = 'You have not created a flow yet';
        } else if (err.code == flogo.ERRORS.NOT_FOUND) {
          msg = `I didn't find ${isTrigger ? 'a' : 'an'} ${entity} named "${entityName}"`;
        }
      }
      return bot.replyPrivate(message, msg);
    });
}

function _show(bot, message, params) {
  var flowName = params.join(' ');

  if(flowName) {
    return flogo.getFlow(flowName)
      .then(flow => {
        if (flow) {
          bot.replyPublic(message, formatter.formatFlow(flow));
        } else {
          bot.replyPublic(message, 'There is no flow with that name');
        }
      })
      .catch(err => {
        console.error(err);
        bot.replyPrivate(message, 'Oh no, something wen\'t wrong');
      });
  } else {
    return flogo.listFlows()
      .then(flows => {
        if(flows && flows.length > 0) {
          bot.replyPublic(message, formatter.formatFlowList(flows));
        } else {
          bot.replyPublic(message, 'You have no flows, want to create one? Tell me: create [name of your flow]');
        }
      })
      .catch(err => {
        console.error(err);
        bot.replyPrivate(message, 'Oh no, something wen\'t wrong');
      });
  }

}

function _list(tileType, bot, message, params) {
  var promise = tileType == 'activities' ? flogo.listActivities() : flogo.listTriggers();

  return promise
    .then(tiles => {
      if(tiles && tiles.length > 0) {
        var replyMsg = formatter.formatTileList(tiles, {
          title: tileType
        });
        bot.replyPubliv(message, replyMsg);
      } else {
        bot.replyPublic(message, `No ${tileType} found`);
      }
    })
    .catch(err => {
      console.error(err);
      bot.replyPrivate(message, 'Oh no, something wen\'t wrong');
    });
}

function _isKnownSlashCommand(commandName) {
  for (var type in SLASH_COMMANDS) {
    if (SLASH_COMMANDS.hasOwnProperty(type) && SLASH_COMMANDS[type] === commandName) {
      return true;
    }
  }
  return false;
}
