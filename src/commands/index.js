const Eris = require('eris');
const loadPrefixes = require('chat-commands/src/prefixes');
const parseFlags = require('chat-commands/src/flags');
const commands = require('../util/commandLoader')(__dirname);

const prefixes = loadPrefixes(process.env.PREFIXES, ['@mention']);

/**
 * @param {Eris.Client} discord 
 */
module.exports = (discord, fallback = '') => {
  discord.on('messageCreate', (msg) => {
    const ignoreSelf = msg.author.id === discord.user.id;
    const ignoreBots = msg.author.bot;
    if (ignoreSelf || ignoreBots) return;
  
    const filtered = msg.content.replace(/<@!/g, '<@');
    const from = prefixes.map((pref) => pref.replace('@mention', discord.user.mention)).filter(_ => _);
    const prefix = from.find((pref) => filtered.startsWith(pref));
    if (!prefix) return;
  
    const {
      message: rawText = '',
      flags = {},
    } = parseFlags(filtered.substring(prefix.length));
  
    const args = rawText.split(/\s+/g);
    const command = args.shift() || fallback;
  
    msg.prefix = prefix;
    msg.command = command;
    msg.reply = (content, file) => {
      if (content.file && !file) {
        file = content.file;
        delete content.file;
      }
      if (typeof content === 'string') {
        content = { content };
      }
      if (!content.message_reference) {
        content.message_reference = {
          message_id: msg.id,
        };
      }
      return discord.createMessage(msg.channel.id, content, file);
    };
    msg.connection = discord;
    msg.mention = discord.user.mention;

    commands
      .then((commandMap) => flags.help ? commandMap.get('help') : commandMap.get(command.toLowerCase()))
      .then((command) => {
        if (!command || !command.enabled(msg) && !bypass(msg, { check: flags.admin })) return undefined;
        if (flags.help) {
          if (msg.command) args.unshift(msg.command);
          msg.command = 'help';
        }
        return command.handle(msg, args, flags);
      }).then((response) => {
        if (!response || response instanceof Eris.Message) return undefined;
        return msg.reply(response);
      }).catch((e) => {
        console.error(e);
        if (typeof e === 'string') return msg.reply(e);
        return msg.reply(`Error processing command: ${e.message || e.toString()}`);
      }).catch(console.error); // Oh the irony
  });
};
