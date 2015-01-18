# leap-model

A lightweight alternative to Backbone.Model with support for nested attributes.

`leap-model` provides 2 different implementations depending on your needs:

* a lightweight alternative to Backbone.Model with nested attributes support with no dependencies on Backbone or Underscore (`require('leap-model')`)
* and a 100% Backbone compatible Model with nested attributes support (`require('leap-model/compat')`)

The first option is useful for when you don't need the whole Backbone and don't need the REST syncing parts of the model (save/fetch/sync/destroy). It's great for storing view state. Moreover, with the nested attribute support you can store arbitrary nested JSON.

The second option is great if you're already using Backbone, but want nested attribute support. The code for that is based on [`backbone-deep-model`](https://github.com/powmedia/backbone-deep-model). LeapModel brings several advantages over `backbone-deep-model`

* get deepClones attributes for more defensive defaults (the only way to muttate the model is by `setting` or modifying `attributes` directly)
* passes 100% of Backbone's tests
* better AMD/CJS support - require("leap-model/compat").extend()
* does not pollute globals (file an issue if you need it - we could add it in a separately built file)
* does not allow modifying separator via a global attribute
* does not pollute underscore with extra methods
* does not depend on underscore at all


## Example

### leap-model

This version does not depend on Backbone or Underscore. It depends on `backbone-standalone-events`.

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

### leap-model/compat

This version extends Backbone.Model and does not use `backbone-standalone-events`.

```js
var LeapModelCompat = require("leap-model/compat");
var tasks = Backbone.Collection.extend({
  model: LeapModelCompat.extend({})
});
```

## API

LeapModel supports the following Backbone.Model methods

```
– extend
– constructor / initialize
– get
– set
– escape
– has
– unset
– clear
– id
– idAttribute
– cid
– attributes
– changed
– defaults
– toJSON
– validate
– validationError
– isValid
– clone
– isNew
– hasChanged
– changedAttributes
– previous
– previousAttributes
```

# TODO

- [ ] remove underscore usage
- [ ] improve README