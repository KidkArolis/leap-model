(function (define) { 'use strict';
define(function (require) { // jshint ignore:line

  var extend = require('./extend');

  // LeapBase
  // --------
  //
  // LeapBase helps with separating leapMethods into it's own module.
  // We extend Backbone.Model with leapMethods to get LeapModelCompat
  // and extend LeapBase with leapMethods to get LeapModel.

  var LeapBase = function() {};
  LeapBase.extend  = extend;
  return LeapBase;

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });