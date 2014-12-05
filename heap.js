function Heap(comparator) {
  this.comparator = comparator;
  this.buffer = [];
}
Heap.prototype.push = function(element) {
  var index = this.buffer.length;
  this.buffer.push(element);

  while (index > 0) {
    var parentIndex = (index - 1) >> 1;
    var parentElement = this.buffer[parentIndex];
    if (this.comparator(parentElement, element) < 0) break;
    this.buffer[index] = parentElement;
    this.buffer[parentIndex] = element;
    index = parentIndex;
  }
};
Heap.prototype.pop = function() {
  if (this.buffer.length <= 1) {
    // last element
    return this.buffer.pop();
  }
  var result = this.buffer[0];
  this.buffer[0] = this.buffer.pop();

  var parentIndex = 0;
  while (true) {
    var leftIndex = parentIndex * 2 + 1;
    var rightIndex = parentIndex * 2 + 2;
    if (leftIndex >= this.buffer.length) {
      // no children
      break;
    }
    var childIndex;
    if (rightIndex >= this.buffer.length) {
      // single child
      childIndex = leftIndex;
    } else {
      // two children
      var childIndex = this.comparator(this.buffer[leftIndex], this.buffer[rightIndex]) < 0 ? leftIndex : rightIndex;
    }
    var parentElement = this.buffer[parentIndex];
    var childElement = this.buffer[childIndex];
    if (this.comparator(parentElement, childElement) < 0) break;
    this.buffer[parentIndex] = childElement;
    this.buffer[childIndex] = parentElement;
    parentIndex = childIndex;
  }

  return result;
};
Heap.prototype.size = function() {
  return this.buffer.length;
};
