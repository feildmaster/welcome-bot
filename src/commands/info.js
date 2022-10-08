const Command = require('chat-commands/src/command');
const Eris = require('eris');
const config = require('../config');
const formatChannels = require('../util/formatChannels');

function handler(msg, args = [], flags = {}) {
  const {
    channels,
    join,
    leave,
  } = config.get(msg.channel.guild);
  return {
    embeds: [{
      type: 'rich',
      title: `Configuration`,
      fields: [{
        name: 'Channel List',
        value: channels.length ? formatChannels(channels).join(' ') : 'None',
      }, {
        ...format('Join', join),
      }, {
        ...format('Leave', leave),
      }],
      color: 0x1834e7,
    }],
  };
}

function format(name, { enabled, message: value }) {
  const enable = enabled ? enabled === true || enabled < Date.now() : false;
  return {
    name: `${enable ? '🟢' : '🔴'} ${name}`,
    value,
  };
}

module.exports = new Command({
  title: '',
  alias: ['info'],
  examples: [],
  usage: '',
  description: '',
  flags: [{
    alias: [],
    usage: '',
  }],
  disabled: false,
  handler,
});
