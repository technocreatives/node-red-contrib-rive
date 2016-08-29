module.exports = function(RED) {
  'use strict';

  var RiveScript = require('rivescript');

  function RiveNode(n) {
    RED.nodes.createNode(this,n);
    var node = this;
    this.script = n.script;

    this.on('input', function(msg) {

      var script = node.script;
      var bot = new RiveScript({utf8: true, debug: false});
      // TODO: setUservars('localuser', ...) from node context
      bot.stream(script);
      bot.sortReplies();
      var reply = bot.reply('localuser', msg.payload);

      if(reply.match(/^ERR:/)) {
        msg.payload = reply;
        node.send([null,msg]);
      } else {
        // TODO: get updated user vars from bot ( getUservars('localuser') ) and put back in node context
        // omit 'topic', '__initialmatch__', '__history__' and '__lastmatch__'
        msg.payload = reply;
        node.send([msg,null]);
      }

    });

  }

  RED.nodes.registerType('rive', RiveNode);

};