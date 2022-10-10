module.exports = (enabled) => enabled === false // Hard disable
  || Number.isInteger(enabled) && enabled > Date.now() // Soft time-out disable
