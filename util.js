window.util = {
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

  popRandom: function(array) {
    // swap a random item with the last item, then pop the one we just put there
    var index = Math.floor(Math.random() * array.length);
    var lastIndex = array.length - 1;
    var tmp = array[index];
    array[index] = array[lastIndex];
    array[lastIndex] = tmp;
    return array.pop();
  },

  randomInt: function(lessThanThis) {
    return Math.floor(Math.random() * lessThanThis);
  },

  euclideanMod: function(numerator, denominator) {
    var result = numerator % denominator;
    if (result < 0) result += denominator;
    return result;
  },
};
