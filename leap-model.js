(function (define) { 'use strict';
define(function (require) { // jshint ignore:line

  var BackboneEvents = require('backbone-events-standalone');
  var leapMethods = require('./lib/leap-methods');
  var extend = require('./lib/extend');

  // LeapBase
  // --------
  //
  // LeapBase helps with separating leapMethods into it's own module.
  // We extend Backbone.Model with leapMethods to get LeapModelCompat
  // and extend LeapBase with leapMethods to get LeapModel.

  var LeapBase = function() {};
  LeapBase.extend = extend;

  // LeapModel
  // ---------
  //
  // LeapModel is a Backbone.Model inspired Model with a subset of functionality
  // of the Backbone.Model + support for deeply nested objects.
  //
  // Here we extend the LeapBase (blank extendable object) with the leapMethods
  // and mixin the backbone-events-standalone. We use standalone backbone events
  // implementation to make LeapModel work without needing Backbone and Underscore.
  //
  // The reason leapMethods are in a separate module
  // is so that we could have both a standalone, lightweight, dependency free LeapModel
  // implementation, but we can reuse the leapMethods to add nested object support
  // to the real Backbone.Model in the leap-model/compat.

  var LeapModel = LeapBase.extend(leapMethods);

  BackboneEvents.mixin(LeapModel.prototype);

  return LeapModel;

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });