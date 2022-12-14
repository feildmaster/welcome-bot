require('dotenv').config();
const Eris = require('eris');
const config = require('./src/config');
const formatMessage = require('./src/util/formatMessage');
const isDisabled = require('./src/util/isDisabled');
const loadCommands = require('./src/commands');
const { MINUTE } = require('./src/util/constants');

const { Intents } = Eris.Constants;

const token = process.env.TOKEN;
if (!token) throw new Error('Missing token');
const discord = new Eris.Client(token, {
  intents: Intents.allNonPrivileged | Intents.guildMessages | Intents.guildMembers,
});

loadCommands(discord, 'help');
discord.on('guildMemberAdd', handleJoin)
  .on('guildMemberRemove', handleLeave)
  .on('connect', () => console.info('Connected'))
  .on('error', console.error)
  .connect();

/**
 * @param {Eris.Guild} guild 
 * @param {Eris.Member} user
 */
function handleJoin(guild, user) {
  if (invalid(user, guild, 'join')) return;

  const { channels = [], join: { message = '' } } = config.get(guild);
  channels.forEach((channel) => discord.createMessage(channel, formatMessage(message, user.mention)));
}

/**
 * @param {Eris.Guild} guild 
 * @param {Eris.Member} user
 */
function handleLeave(guild, user) {
  if (invalid(user, guild, 'leave') || !user.username) return;

  const { channels = [], leave: { message = '' } } = config.get(guild);
  channels.forEach((channel) => discord.createMessage(channel, formatMessage(message, user.username)));
}

function invalid(user, guild, joinLeave) {
  // Theoretically, this first case is impossible to do.
  if (user.id === discord.user.id || user.bot) return true;

  if (!joinLeave) return false;
  const { channels = [], [joinLeave]: { enabled = false } } = config.get(guild, false);
  return isDisabled(enabled) || // Disabled
    !channels.length || // Not setup
    throttled(guild); // Throttled
}

/**
 * @param {Eris.Guild} guild 
 */
function throttled(guild) {
  const now = Date.now();
  const { throttle = now, ceiling = 15000, margin = 3000 } = config.get(guild);
  const diff = throttle <= now ? 0 : throttle - now;

  const data = { throttle: now + diff + margin };
  if (diff >= ceiling) {
    data.enabled = now + 10 * MINUTE;
  } else if (diff === 0) {
    data.enabled = true; // Reset to true
  }
  
  config.set(guild, data);
  return Number.isInteger(data.enabled);
}
