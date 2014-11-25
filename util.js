window.util = {
  shuffle: function(array) {
    for (var i = 0; i < array.length; i++) {
      var j = Math.floor(Math.random() * (array.length - i)) + i;
      var tmp = array[j];
      array[j] = array[i];
      array[i] = tmp;
    }
  },

  inherits: function(ctor, superCtor) {
    // copied from nodejs's util.js
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  },
};
