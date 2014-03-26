(function(factory) {

  //  Start with AMD.
  if (typeof define === "function" && define.amd)
    define(["underscore", "backbone"], factory);

  // Next for Node.js or CommonJS.
  else if (typeof exports === "object")
    factory(require("underscore"), require("backbone"));

  // Finally, as a browser global.
  else
    factory(_, Backbone);

}(function(_, Backbone) {
  // @include lib/backbone.collectionsubset.js
}));
