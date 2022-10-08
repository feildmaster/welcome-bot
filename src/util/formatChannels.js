function formatChannels(channels = ['']) {
  return channels.map(channel => `<#${channel}>`);
}

module.exports = formatChannels;
