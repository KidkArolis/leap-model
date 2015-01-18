(function (define) { 'use strict';
define(function (require) { // jshint ignore:line

  var leapMethods = require('./lib/leap-methods');
  var Backbone = require('backbone');

  // LeapModelCompat
  // ---------------
  //
  // LeapModelCompat is a 100% Backbone compatible model implementation
  // with additional support for nested objects. This is a successor
  // to `backbone-deep-model`. See README for the differences between `leap-model`
  // and `backbone-deep-model`, as well as differences between `leap-model` and
  // `Backbone.Model`.
  //
  // Here we extend the BackboneModel with leapMethods - a collection
  // of Backbone.Model methods with added support for nested objects.
  //
  // In the compat version, unlike the leap-model version, we don't have to use
  // the `extend` helper or standalone `backbone-events` implementation since
  // Backbone.Model already has those. That way this results in smaller filesize.

  var LeapModelCompat = Backbone.Model.extend(leapMethods);

  return LeapModelCompat;

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });