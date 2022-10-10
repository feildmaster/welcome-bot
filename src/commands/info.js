const UserCommand = require('chat-commands/src/command/user');
const config = require('../config');
const formatChannels = require('../util/formatChannels');
const formatMessage = require('../util/formatMessage');

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
        value: channels.length ? formatChannels(channels).join(' ') : 'Empty',
      }, {
        ...format('Join', join, msg.author),
      }, {
        ...format('Leave', leave, msg.author),
      }],
      color: 0x1834e7,
    }],
  };
}

function format(name, { enabled, message }, { mention }) {
  return {
    name: `${enabled ? '🟢' : '🔴'} ${name}`,
    value: formatMessage(message, mention),
  };
}

module.exports = new UserCommand({
  title: 'Channel List',
  alias: ['info'],
  handler,
});
