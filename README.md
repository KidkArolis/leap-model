# leap-model

This is a standalone model for storing complex application state.
It has a subset of Backbone.Model functionality as well as supports nested objects.

This is useful for when you don't need the whole Backbone and don't need the REST syncing stuff.
Good for storing view state, etc. It allows storing arbitrary nested JSON.

It can also be used to add nested attribute support to your Backbone Models.
The code is taken from `backbone-deep-model` so you can also use that, the differences are:

* get deepClones for immutability
* unsetting bugfix
* passes 100% of Backbone's tests
* better AMD/CJS support - require("leap-model/backbone-model").extend()
* does not have globals support (file an issue if you need it - we could add it in a separately built file)
* does not allow modifying separator via a global attribute
* does not pollute underscore with extra methods

Example

This version depends on the npm package `backbone-standalone-events`

```js
var LeapModel = require("leap-model");
var m = LeapModel.extend({
  foo: {
    bar: 1
  }
});
m.set("foo.bar", 2);
m.get("foo"); // => {bar: 2}
```


It ships with a fully Backbone Model compatible version too.
This version extends Backbone.Model and does not use `backbone-standalone-events`.

```js
var LeapModel = require("leap-model/backbone-model");
var tasks = Backbone.Collection.extend({
  model: LeapModel.extend({})
});
```

Third version - with subscribtions based event API (`event-kit`);

## Caveats

Currently there is one feature that's not fully compatible - defaults

```js
var Defaulted = Backbone.Model.extend({
  defaults: {
    "one": 1,
    "two": 2
  }
});
var model = new Defaulted({two: undefined});
equal(model.get('one'), 1);
equal(model.get('two'), 2);
```