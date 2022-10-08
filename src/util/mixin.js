function isObject(obj) {
  return typeof obj === 'object' && !Array.isArray(obj);
}

function mixin(target, ...rest) {
  rest.forEach((obj) => {
    if (!isObject(obj)) return;
    Object.keys(obj).forEach((key) => {
      mix(target, obj[key], key);
    });
  });
  return target;
}

function mix(target, val, key) {
  const obj = target[key];
  if (isObject(val)) {
    if (isObject(obj)) {
      mixin(obj, val);
    } else {
      target[key] = mixin({}, val);
    }
  } else {
    target[key] = val;
  }
}

module.exports = mixin;
