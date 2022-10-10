const Conf = require('conf');
const mixin = require('./util/mixin');

const schemaJoinLeave = {
  type: 'object',
  properties: {
    enabled: {
      type: ['boolean', 'integer'],
    },
    message: {
      type: 'string',
    },
  },
};

const config = new Conf({
  schema: {
    meta: {
      type: 'object',
      description: 'Parent object for `conf` to work',
      patternProperties: {
        '^\\d+$': {
          type: 'object',
          description: 'Server ID',
          properties: {
            channels: {
              type: 'array',
              items: { type: 'string' },
            },
            join: schemaJoinLeave,
            leave: schemaJoinLeave,
            throttle: {
              type: 'number',
            },
          },
        },
      },
    }
  },
});

function get({ id }, convert = true) {
  const defaults = {
    channels: [''],
    join: {
      enabled: true,
      message: '$user has joined the server.',
    },
    leave: {
      enabled: true,
      message: '$user has left the server.',
    },
  };
  defaults.channels.shift(); // Remove type setter
  mixin(defaults, config.get(`meta.${id}`));
  if (convert) {
    ['join', 'leave'].forEach(key => {
      const { enabled } = defaults[key];
      if (Number.isInteger(enabled)) {
         // By passing a truthy for `convert` you can keep the raw number if it's soft-disabled
        defaults[key].enabled = enabled < Date.now() || convert !== true && enabled;
      }
    });
  }
  return defaults;
}

function set({ id }, data = {}) {
  config.set(`meta.${id}`, mixin(config.get(`meta.${id}`, {}), data));
}

exports.get = get;
exports.set = set;
exports.raw = config;
