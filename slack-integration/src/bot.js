var flogo = require('./flogo');
var formatter = require('./reply-formatter');

module.exports = function (controller) {

  controller.hears(['create (.*)', 'create[\s]*'],
    ['direct_message', 'direct_mention', 'mention'],
    (bot, message) => {
      var flowName = message.match[1];
      if (!flowName) {
        return bot.reply(message, "You need to tell me the name of your new flow: `create [name of your flow]`");
      }

      bot.startTyping(message);
      flogo.create(flowName)
        .then(() => bot.reply(message, `I created the flow "${flowName}" and now it is your current flow :smile:`))
        .catch(err => {
          console.error(err);
          if (err.code && err.code == flogo.ERRORS.ALREADY_EXISTS) {
            bot.reply(message, 'There\'s already a flow with that name. You may want to try another name.');
          } else {
            bot.reply(message, 'Oh no, something wen\'t wrong');
          }
        });
    });

  controller.hears(['add (activity|trigger) (.*)'],
    ['direct_message', 'direct_mention', 'mention'],
    (bot, message) => {
      var entity = match[1].toLowerCase();
      if (entity != 'trigger' && entity != 'activity') {
        return bot.reply(message, 'I can only add activities and triggers');
      }

      var entityName = match[2];
      if (!entityName) {
        return bot.reply(message, `Add what? Tell me: add ${entity} [name-of-the-${entity}]`);
      }


      var isTrigger = entity == 'trigger';
      var promise = null;
      if (isTrigger) {
        promise = flogo.addTrigger(entityName);
      } else {
        promise = flogo.addActivity(entityName);
      }

      promise
        .then(res => bot.reply(message, `Added ${entity} "${entityName}" to flow "${res.flowName}"`))
        .catch(err => {
          var msg = 'Oh no, something wen\'t wrong';
          if (err && err.code) {
            if (err.code == flogo.ERRORS.NO_FLOW) {
              msg = 'You have not created a flow yet';
            } else if (err.code == flogo.ERRORS.NOT_FOUND) {
              msg = `I didn't find ${isTrigger ? 'a' : 'an'} ${entity} named "${entityName}"`;
            }
          }
          return bot.reply(message, msg);
        });

    });

  controller.hears(['show\s*(.*)'],
    ['direct_message', 'direct_mention', 'mention'],
    (bot, message) => {

      var flowName = message.match[1];
      if (!flowName) {
        return listFlows(bot, message);
      }

      flogo.getFlow(flowName)
        .then(flow => {
          if (flow) {
            bot.reply(message, formatter.formatFlow(flow));
          } else {
            bot.reply(message, 'I didn\'t find a flow with that name');
          }
        })
        .catch(err => {
          bot.reply(message, 'Oh no, something wen\'t wrong');
        });

    });

  controller.hears(['list( flows)?'], ['direct_message', 'direct_mention', 'mention'], listFlows);

  controller.hears(['hello', 'hi'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
    bot.reply(message, 'Hello. What can I do for you? :steam_locomotive:');
  });

  controller.hears(['current flow'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
    var currentFlow = flogo.getLast();
    if(currentFlow) {
      return bot.reply(message, `Your current flow is ${currentFlow.name}`);
    } else {
      return bot.reply(message, 'You have no current flow.');
    }
  });

  function listFlows(bot, message) {
    bot.startTyping(message);
    return flogo.listFlows()
      .then(flows => {
        if(flows && flows.length > 0) {
          bot.reply(message, formatter.formatFlowList(flows));
        } else {
          bot.reply(message, 'You have no flows, want to create one? Tell me: create [name of your flow]');
        }
      })
      .catch(err => {
        console.error(err);
        bot.reply(message, 'Oh no, something wen\'t wrong');
      });

  }

};
