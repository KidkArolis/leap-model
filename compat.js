(function (define) { 'use strict';
define(function (require) { // jshint ignore:line

  var LeapModel = require('./leap-model');
  var Backbone = require('backbone');

  var Model = Backbone.Model.extend(LeapModel.prototype);

  return Model;

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });