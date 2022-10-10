module.exports = (message = '', mention = '') => message.replace(/\$user(?!\`)/g, mention);
