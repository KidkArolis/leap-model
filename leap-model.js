var keyPathSeparator = '.';

/**
 * Takes a nested object and returns a shallow object keyed with the path names
 * e.g. { "level1.level2": "value" }
 *
 * @param  {Object}      Nested object e.g. { level1: { level2: 'value' } }
 * @return {Object}      Shallow object with path names e.g. { 'level1.level2': 'value' }
 */
function objToPaths(obj) {
  var ret = {},
      separator = keyPathSeparator;

  for (var key in obj) {
      var val = obj[key];

      if (val && (val.constructor === Object || val.constructor === Array) && !_.isEmpty(val)) {
          //Recursion for embedded objects
          var obj2 = objToPaths(val);

          for (var key2 in obj2) {
              var val2 = obj2[key2];

              ret[key + separator + key2] = val2;
          }
      } else {
          ret[key] = val;
      }
  }

  return ret;
}

/**
 * @param {Object}  Object to fetch attribute from
 * @param {String}  Object path e.g. 'user.name'
 * @return {Mixed}
 */
function getNested(obj, path, return_exists) {
    var separator = ".";

    if (!path) {
      if (obj && obj.hasOwnProperty(path)) {
        return obj[path];
      } else {
        return;
      }
    }

    var fields = path !== undefined && path !== null ? (path + "").split(separator) : [];
    var result = obj;
    return_exists || (return_exists === false);
    for (var i = 0, n = fields.length; i < n; i++) {
        if (return_exists && !_.has(result, fields[i])) {
            return false;
        }
        result = result[fields[i]];

        if (result == null && i < n - 1) {
            result = {};
        }

        if (typeof result === 'undefined') {
            if (return_exists)
            {
                return true;
            }
            return result;
        }
    }
    if (return_exists)
    {
        return true;
    }
    return result;
}

 /**
 * @param {Object} obj                Object to fetch attribute from
 * @param {String} path               Object path e.g. 'user.name'
 * @param {Object} [options]          Options
 * @param {Boolean} [options.unset]   Whether to delete the value
 * @param {Mixed}                     Value to set
 */
function setNested(obj, path, val, options) {
    options = options || {};

    var separator = keyPathSeparator;

    var fields = path !== undefined && path !== null ? (path + "").split(separator) : [];
    var result = obj;
    for (var i = 0, n = fields.length; i < n && result !== undefined ; i++) {
        var field = fields[i];

        //If the last in the path, set the value
        if (i === n - 1) {
            options.unset ? delete result[field] : result[field] = val;
        } else {
            //Create the child object if it doesn't exist, or isn't an object
            if (typeof result[field] === 'undefined' || ! _.isObject(result[field])) {
                var nextField = fields[i+1];

                // create array if next field is integer, else create object
                result[field] = /^\d+$/.test(nextField) ? [] : {};
            }

            //Move onto the next part of the path
            result = result[field];
        }
    }
}

function deleteNested(obj, path) {
  setNested(obj, path, null, { unset: true });
}


// fully backbone compatible version Backbone.Model.extend(deep);
// simpler version with a subset of features that does not depend on backbone Base.extend(deep) + Events.mixin(DeepModel.prototype)

(function(root, factory) {

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'exports'], function(_, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.LeapModel = factory(root, exports, _);
    });

  // Next for Node.js or CommonJS.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    factory(root, exports, _);

  // Finally, as a browser global.
  } else {
    root.LeapModel = factory(root, {}, root._);
  }

}(this, function(root, LeapModel, _) {

  // Initial Setup
  // -------------

  // Create local references to array methods we'll want to use later.
  var array = [];
  var slice = array.slice;

  // Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = function(attributes, options) {
    var defaults;
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (defaults = _.result(this, 'defaults')) {
        //<custom code>
        // Replaced the call to _.defaults with _.deepExtend.
        attrs = _.deepExtend({}, defaults, attrs);
        //</custom code>
    }
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.deepClone(this.attributes);
    },

    // Override get
    // Supports nested attributes via the syntax 'obj.attr' e.g. 'author.user.name'
    get: function(attr) {
        return _.deepClone(getNested(this.attributes, attr));
    },


    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Override set
    // Supports nested attributes via the syntax 'obj.attr' e.g. 'author.user.name'
    set: function(key, val, options) {
        var attr, attrs, unset, changes, silent, changing, prev, current;
        if (key == null) return this;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (typeof key === 'object') {
          attrs = key;
          options = val || {};
        } else {
          (attrs = {})[key] = val;
        }

        options || (options = {});

        // Run validation.
        if (!this._validate(attrs, options)) return false;

        // Extract attributes and options.
        unset           = options.unset;
        silent          = options.silent;
        changes         = [];
        changing        = this._changing;
        this._changing  = true;

        if (!changing) {
          this._previousAttributes = _.deepClone(this.attributes); //<custom>: Replaced _.clone with _.deepClone
          this.changed = {};
        }
        current = this.attributes, prev = this._previousAttributes;

        // Check for changes of `id`.
        if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

        //<custom code>
        attrs = objToPaths(attrs);
        //</custom code>

        // For each `set` attribute, update or delete the current value.
        for (attr in attrs) {
          val = attrs[attr];

          //<custom code>: Using getNested, setNested and deleteNested
          if (!_.isEqual(getNested(current, attr), val)) changes.push(attr);
          if (!_.isEqual(getNested(prev, attr), val)) {
            setNested(this.changed, attr, val);
          } else {
            deleteNested(this.changed, attr);
          }
          unset ? deleteNested(current, attr) : setNested(current, attr, val);
          //</custom code>
        }

        // Trigger all relevant attribute changes.
        if (!silent) {
          if (changes.length) this._pending = true;

          //<custom code>
          var separator = keyPathSeparator;
          var alreadyTriggered = {}; // * @restorer

          for (var i = 0, l = changes.length; i < l; i++) {
            var key = changes[i];

            if (!alreadyTriggered.hasOwnProperty(key) || !alreadyTriggered[key]) { // * @restorer
              alreadyTriggered[key] = true; // * @restorer
              this.trigger('change:' + key, this, getNested(current, key), options);
            } // * @restorer

            var fields = key.split(separator);

            //Trigger change events for parent keys with wildcard (*) notation
            for(var n = fields.length - 1; n > 0; n--) {
              var parentKey = _.first(fields, n).join(separator),
                  wildcardKey = parentKey + separator + '*';

              if (!alreadyTriggered.hasOwnProperty(wildcardKey) || !alreadyTriggered[wildcardKey]) { // * @restorer
                alreadyTriggered[wildcardKey] = true; // * @restorer
                this.trigger('change:' + wildcardKey, this, getNested(current, parentKey), options);
              } // * @restorer

              // + @restorer
              if (!alreadyTriggered.hasOwnProperty(parentKey) || !alreadyTriggered[parentKey]) {
                alreadyTriggered[parentKey] = true;
                this.trigger('change:' + parentKey, this, getNested(current, parentKey), options);
              }
              // - @restorer
            }
            //</custom code>
          }
        }

        if (changing) return this;
        if (!silent) {
          while (this._pending) {
            this._pending = false;
            this.trigger('change', this, options);
          }
        }
        this._pending = false;
        this._changing = false;
        return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"` unless you choose
    // to silence it.
    clear: function(options) {
      var attrs = {};
      var shallowAttributes = objToPaths(this.attributes);
      for (var key in shallowAttributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return getNested(this.changed, attr, true);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      //<custom code>: objToPaths
      if (!diff) return this.hasChanged() ? objToPaths(this.changed) : false;
      //</custom code>

      var old = this._changing ? this._previousAttributes : this.attributes;

      //<custom code>
      diff = objToPaths(diff);
      old = objToPaths(old);
      //</custom code>

      var val, changed = false;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;

      //<custom code>
      return getNested(this._previousAttributes, attr);
      //</custom code>
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.deepClone(this._previousAttributes);
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  BackboneEvents.mixin(Model.prototype);

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend  = extend;

  return Model;

}));
