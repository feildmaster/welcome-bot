const Command = require('chat-commands/src/command');
const Eris = require('eris');
const config = require('../config');
const formatChannels = require('../util/formatChannels');

/**
 * 
 * @param {Eris.Message} msg 
 * @param {String[]} args 
 * @param {} flags 
 * @returns 
 */
function handler(msg, args = [], { remove } = {}) {
  const { guild } = msg.channel;
  const { channels } = config.get(guild);

  const removeChannels = remove || ['disable', 'remove'].includes(msg.command);

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
        value: formatChannels(channels).join(' '),
      }],
      color: 0x1834e7,
    }],
  };
}

module.exports = new Command({
  title: '',
  alias: ['enable', 'init', 'disable', 'remove'],
  examples: [],
  usage: '[...#channel]',
  description: '',
  flags: [{
    alias: ['remove', '-', 'r'],
    usage: '',
  }, {
    alias: ['clear'],
    usage: '',
  }],
  disabled: false,
  handler,
});
