const config = require('../src/config');

const guild = { id: 12341234 };

function print() {
  console.log('meta:', config.get(guild));
}

// Yes, I know this isn't really a test
print();
config.set(guild, {
  leave: {
    enabled: false,
  },
});
print();
config.set(guild, {
  leave: {
    message: 'okay, bye bye, $user!'
  },
});
print();
config.set(guild, {
  channels: ['1234']
});
print();
config.set(guild, {
  channels: []
});
print();