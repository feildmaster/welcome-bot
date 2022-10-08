const Command = require('chat-commands/src/command');
const HelpCommand = require('chat-commands/src/help');
const fs = require('fs').promises;
  
module.exports = (directory, {
  mapping = new Map([['', new Command()]]),
  array = [],
  helpCommand = true,
  helpOptions = {},
} = {}) => {
  mapping.delete(''); // remove fake command
  function register(command = new Command()) {
    if (!command.alias.length) return;
    array.push(command);
    command.alias.forEach((alias) => {
      if (mapping.has(alias)) {
        console.debug(`${file}:${alias} already registered`);
      } else {
        mapping.set(alias, command);
      }
    });
  }

  if (!directory) throw new Error('Unknown directory');
  if (helpCommand && !mapping.has('help')) {
    const help = new HelpCommand({
      ...helpOptions,
      commands: array,
    });
    register(help);
  }
  return fs.readdir(directory)
    .then(files => {
      files.forEach((file) => {
        if (file.startsWith('.') || file.match(/index\.js$/) || !file.endsWith('.js')) return;

        const command = require(`${directory}/${file}`);
        if (!(command instanceof Command)) return console.debug('Bad file:', file, typeof command);

        register(command);
      });
    })
    .then(() => mapping);
};
