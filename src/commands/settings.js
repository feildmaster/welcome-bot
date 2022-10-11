const Command = require('chat-commands/src/command/user');
const { Constants: { Permissions } } = require('eris');
const config = require('../config');
const formatMessage = require('../util/formatMessage');
const { MINUTE, COLOR } = require('../util/constants');
const isDisabled = require('../util/isDisabled');

function handler(msg, _ = [], flags = {}) {
  const command = msg.command === 'join' ? 'join' : 'leave';
  const { guild } = msg.channel;
  const {
    [command]: data,
  } = config.get(guild, 'convert');

  [
    [updateEnabled, 'enabled'],
    [updateMessage, 'message'],
    [throttle, 'enabled'],
  ].forEach(([func, key]) => {
    if (func.call(this, data, flags)) {
      // Update file if changed
      config.set(guild, { [command]: { [key]: data[key] } });
    }
  });

  return {
    embeds: [{
      title: `${isDisabled(data.enabled) ? '🔴' : '🟢'} Settings`,
      description: Number.isInteger(data.enabled) ? `Enabling <t:${Math.floor(data.enabled/1000)}:R>` : '',
      fields: [{
        name: 'Message',
        value: `${formatMessage(data.message, msg.author.mention)}
        ${!data.message.includes('$user') ? '⚠️ Warning: $user is missing from message' : ''}`,
      }],
      footer: {
        text: '`$user` -> username',
      },
      color: COLOR,
    }],
  };
}

function updateEnabled(data, flags) {
  const disable = this.flag('disable', flags);
  if (!(disable || this.flag('enable', flags))) return;
  const enabled = !disable;
  if (data.enabled !== enabled) {
    data.enabled = enabled;
    return true;
  }
}
function updateMessage(data, flags) {
  const message = this.flag('message', flags);
  if (typeof message === 'string' && message.length && message !== data.message) {
    data.message = message;
    return true;
  }
}
function throttle(data, flags) {
  // Can't throttle if hard-disabled
  if (data.enabled && this.flag('throttle', flags)) {
    data.enabled = Date.now() + 10 * MINUTE;
    return true;
  }
}

module.exports = new Command({
  title: 'Settings',
  alias: ['join', 'leave'],
  examples: [
    ['> <prefix> <label> --e', 'Enables <label> message'],
    ['> <prefix> <label> --d', 'Disables <label> message'],
    ['> <prefix> <label> --m This is a new message that pings $user!', 'Set <label> message'],
  ].map(a => a.join('\n\t')),
  description: '',
  flags: [{
    alias: ['enable', 'e', '+'],
    default: false,
    description: 'Enable <label> message',
  }, {
    alias: ['disable', 'd', '-'],
    default: false,
    description: 'Disable <label> message',
  }, {
    alias: ['message', 'm'],
    description: 'Set <label> message, use `$user` to insert username.',
    usage: '<message>',
  }, {
    alias: ['throttle', 'pause'],
    description: 'Disable <label> for 10 minutes',
  }],
  handler,
}, [Permissions.manageGuild]);
