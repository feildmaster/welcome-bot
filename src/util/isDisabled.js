module.exports = (enabled) => enabled === false // Hard disable
  || enabled > Date.now() // Soft time-out disable
