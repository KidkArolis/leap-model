(function (define) { 'use strict';
define(function (require) { // jshint ignore:line

  return function deepExtend(/*obj_1, [obj_2], [obj_N]*/) {
    var target = arguments[0];

    // convert arguments to array and cut off target object
    var args = Array.prototype.slice.call(arguments, 1);

    var key, val, src, clone;

    args.forEach(function (obj) {
      if (typeof obj !== 'object') return;

      for (key in obj) {
        if ( ! (key in obj)) continue;

        src = target[key];
        val = obj[key];

        if (val === target) continue;

        if (typeof val !== 'object' || val === null) {
          target[key] = val;
          continue;
        } else if (val instanceof Date) {
          target[key] = new Date(val.getTime());
          continue;
        } else if (val instanceof RegExp) {
          target[key] = new RegExp(val);
          continue;
        }

        if (typeof src !== 'object' || src === null) {
          clone = (Array.isArray(val)) ? [] : {};
          target[key] = deepExtend(clone, val);
          continue;
        }

        if (Array.isArray(val)) {
          clone = (Array.isArray(src)) ? src : [];
        } else {
          clone = (!Array.isArray(src)) ? src : {};
        }

        target[key] = deepExtend(clone, val);
      }
    });

    return target;
  };

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });