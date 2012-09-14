# backbone.collectionsubset

Create sub-collections of other collections and keep them in sync.

```coffee
tasks = new TaskCollection
today = tasks.subcollection
  filter: (task) -> task.isToday
```

```js
var tasks = new TaskCollection;
var today = tasks.subcollection({
  filter: function(task) {
    return task.isToday();
  }
});
```

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/anthonyshort/backbone.collectionsubset/master/dist/backbone.collectionsubset.min.js
[max]: https://raw.github.com/anthonyshort/backbone.collectionsubset/master/dist/backbone.collectionsubset.js

In your web page:

```html
<script src="dist/backbone.collectionsubset.min.js"></script>
```

Now you have two methods for creating subsets (or subcollections).

### Collection::subcollection

The easiest way to create a subset is to use `Collection::subcollection`

```js
var TaskCollection = Backbone.Collection.extend();
var tasks = new TaskCollection;
var today = tasks.subcollection({
  filter: function(task) {
    return task.isToday();
  }
});
```

`today` will be an instance of `tasks.constructor`, in this case, `TaskCollection`.

### Backbone.CollectionSubset

If you need access to the subset object itself (you might want to modify the filter) you can create a subset directly.

```js
var allTasks = new Backbone.Collection;
var subset = new Backbone.CollectionSubset({
  parent: allTasks,
  filter: function(task) {
    return task.isToday();
  }
});

var todayTasks = subset.child;

subset.setFilter(function(model){
  return task.isYesterday();
});
```

## Documentation

### Options

### Backbone.CollectionSubset Methods

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

_Also, please don't edit files in the "dist" subdirectory as they are generated via grunt. You'll find source code in the "lib" subdirectory!_

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Anthony Short
Licensed under the MIT license.
