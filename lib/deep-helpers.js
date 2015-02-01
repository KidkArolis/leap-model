(function (define) { 'use strict';
define(function (require) { // jshint ignore:line

  var _ = require('underscore');

  var arrays, basicObjects, deepClone, isBasicObject;
    // __slice = [].slice;

  deepClone = function(obj) {
    var func, isArr;
    if (!_.isObject(obj) || _.isFunction(obj)) {
      return obj;
    }
    if (_.isElement(obj)) {
      return obj;
    }
    if (_.isDate(obj)) {
      return new Date(obj.getTime());
    }
    if (_.isRegExp(obj)) {
      return new RegExp(obj.source, obj.toString().replace(/.*\//, ''));
    }
    isArr = _.isArray(obj || _.isArguments(obj));
    func = function(memo, value, key) {
      if (isArr) {
        memo.push(deepClone(value));
      } else {
        memo[key] = deepClone(value);
      }
      return memo;
    };
    return _.reduce(obj, func, isArr ? [] : {});
  };

  isBasicObject = function(object) {
    if (object === null) return false;
    return (object.prototype === {}.prototype || object.prototype === Object.prototype) &&
      _.isObject(object) &&
      !_.isArray(object) &&
      !_.isFunction(object) &&
      !_.isDate(object) &&
      !_.isRegExp(object) &&
      !_.isArguments(object);
  };

  basicObjects = function(object) {
    return _.filter(_.keys(object), function(key) {
      return isBasicObject(object[key]);
    });
  };

  arrays = function(object) {
    return _.filter(_.keys(object), function(key) {
      return _.isArray(object[key]);
    });
  };

  // removes all nested keys that have value of undefined
  function deepClean(obj) {
    if (!isBasicObject(obj)) {
      return obj;
    }
    return _.reduce(obj, function func(memo, value, key) {
      if (value !== undefined) {
        memo[key] = deepClean(value);
      }
      return memo;
    }, {});
  }

  return {
    deepClone: deepClone,
    deepExtend: require('./deep-extend'),
    deepClean: deepClean
  };

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });