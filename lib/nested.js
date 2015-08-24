(function (define) { 'use strict';
define(function (require) { // jshint ignore:line

  var _ = require('underscore');
  var deepClone = require('./deep-helpers').deepClone;

  var keyPathSeparator = '.';

  /**
   * Takes a nested object and returns a shallow object keyed with the path names
   * e.g. { "level1.level2": "value" }
   *
   * @param  {Object}      obj Nested object e.g. { level1: { level2: 'value' } }
   * @return {Object}          Shallow object with path names e.g. { 'level1.level2': 'value' }
   */
  function objToPaths(obj) {
    var ret = {},
      separator = keyPathSeparator;

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var val = obj[key];

        if (val && (val.constructor === Object || val.constructor === Array) && !_.isEmpty(val)) {
          // Recursion for embedded objects
          var obj2 = objToPaths(val);

          for (var key2 in obj2) {
            if (obj2.hasOwnProperty(key2)) {
              var val2 = obj2[key2];

              ret[key + separator + key2] = val2;
            }
          }
        } else {
          ret[key] = val;
        }
      }
    }

    return ret;
  }

  /**
   * @param {Object}  obj to fetch attribute from
   * @param {String}  path path e.g. 'user.name'
   * @param {Boolean} returnExists whether to test for existance
   * @return {Mixed}
   */
  function getNested(obj, path, returnExists) {
    var separator = keyPathSeparator;

    if (!path) {
      if (obj && obj.hasOwnProperty(path)) {
        return obj[path];
      } else {
        return;
      }
    }

    var fields = path !== undefined && path !== null ? (path + '').split(separator) : [];
    var result = obj;
    returnExists || (returnExists === false);
    for (var i = 0, n = fields.length; i < n; i++) {
      if (returnExists && !_.has(result, fields[i])) {
        return false;
      }
      result = result[fields[i]];

      if (result === null && i < n - 1) {
        result = {};
      }

      if (typeof result === 'undefined') {
        if (returnExists)
        {
          return true;
        }
        return result;
      }
    }
    if (returnExists) {
      return true;
    }
    return result;
  }

   /**
   * @param {Object} obj                Object to fetch attribute from
   * @param {String} path               Object path e.g. 'user.name'
   * @param {Object} val                Value
   * @param {Boolean} [options.unset]   Whether to delete the value
   */
  function setNested(obj, path, val, options) {
    options = options || {};

    var separator = keyPathSeparator;

    var fields = path !== undefined && path !== null ? (path + '').split(separator) : [];
    var result = obj;
    for (var i = 0, n = fields.length; i < n && result !== undefined ; i++) {
      var field = fields[i];

      // If the last in the path, set the value
      if (i === n - 1) {
        options.unset ? delete result[field] : result[field] = deepClone(val);
      } else {
        // Create the child object if it doesn't exist, or isn't an object
        if (typeof result[field] === 'undefined' || ! _.isObject(result[field])) {
          // if we're unsetting, no need to create objects deeper if
          // we didn't find anything at the current level
          if (options.unset) {
          return;
          }

          var nextField = fields[i + 1];

          // create array if next field is integer, else create object
          result[field] = /^\d+$/.test(nextField) ? [] : {};
        }

        // Move onto the next part of the path
        result = result[field];
      }
    }
  }

  function deleteNested(obj, path) {
    setNested(obj, path, null, { unset: true });
  }

  return {
    setNested: setNested,
    getNested: getNested,
    deleteNested: deleteNested,
    objToPaths: objToPaths
  };

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });