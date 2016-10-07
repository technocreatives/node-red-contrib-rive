module.exports = function(RED) {
  'use strict';

  var RiveScript = require('rivescript');

  function RiveNode(n) {
    RED.nodes.createNode(this,n);
    var node = this;
    this.script = n.script;
    this.bot = new RiveScript({utf8: true, debug: false});
    this.bot.stream(this.script);
    this.bot.sortReplies();

    this.on('input', function(msg) {

      if(msg.script) {
        node.script = msg.script;
        node.bot = new RiveScript({utf8: true, debug: false});
        node.bot.stream(node.script);
        node.bot.sortReplies();
      }

      var context = (typeof msg.context === 'object' && msg.context !== null) ? msg.context : {};
      msg.context = context;
      context.user = context.user || 'localuser';
      context.vars = context.vars || {};
      
      node.bot.setUservars(context.user, context.vars);
      
      var reply = node.bot.reply(context.user, msg.payload);

      if(reply.match(/^ERR:/)) {
        msg.error = reply;
        node.send([null,msg]);
      } else {
        context.vars = node.bot.getUservars(context.user);
        delete context.vars.__initialmatch__;
        delete context.vars.__history__;
        delete context.vars.__lastmatch__;
        delete context.vars.topic;
        msg.payload = reply;
        node.send([msg,null]);
      }

    });

    this.on('close', function() {
      // tidy up any state
    });

  }

  RED.nodes.registerType('rive', RiveNode);

};