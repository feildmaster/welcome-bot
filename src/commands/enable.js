const Eris = require('eris');
const UserCommand = require('chat-commands/src/command/user');
const config = require('../config');
const formatChannels = require('../util/formatChannels');

/**
 * 
 * @param {Eris.Message} msg 
 * @param {String[]} args 
 * @returns 
 */
function handler(msg, args = [], { remove, clear } = {}) {
  const { guild } = msg.channel;
  const { channels } = config.get(guild);

  if (clear || msg.command === 'clear') {
    if (!channels.length) return undefined; // Do nothing
    config.set(guild, { channels: [] });
    return {
      embeds: [{
        title: `Cleared channel${channels.length ? 's' : ''}`,
        description: `Removed: ${formatChannels(channels).join(' ')}`,
      }],
    };
  }

  const removeChannels = remove || msg.command === 'remove';

  const msgChannels = msg.channelMentions.length ? msg.channelMentions : [msg.channel.id];
  const applied = msgChannels.filter((channel) => {
    const index = channels.indexOf(channel);
    if (index === -1) { // Does not exist, add channel
      if (removeChannels) return false;
      channels.push(channel);
    } else if (removeChannels) { // Exists, remove channel
      channels.splice(index, 1);
    } else {
      return false;
    }
    return true;
  });

  config.set(guild, { channels });

  return {
    embeds: [{
      title: `${removeChannels ? 'Removed' : 'Added'} channel${applied.length !== 1 ? 's' : ''}`,
      description: applied.length ? formatChannels(applied).join(' ') : 'None',
      fields: [{
        name: 'Channel List',
        value: channels.length ? formatChannels(channels).join(' ') : 'Empty',
      }],
      color: 0x1834e7,
    }],
  };
}

module.exports = new UserCommand({
  title: 'Channel List',
  alias: ['channel', 'chan', 'init', 'add', 'remove', 'clear'],
  examples: [
    ['> <prefix> add', 'Add current channel'],
    ['> <prefix> add #channel1 #channel3', 'Add channel one and three'],
    ['> <prefix> remove #channel2', 'Remove channel two'],
    ['> <prefix> clear', 'Clear channel list'],
  ].map(a => a.join('\n')),
  usage: '[#channel...]',
  description: 'Modify the channel list',
  flags: [{
    alias: ['remove', '-', 'r'],
    description: 'Remove channel(s)',
  }, {
    alias: ['clear'],
    description: 'Clear channel list',
  }],
  handler,
});
