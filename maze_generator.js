
function MazeGenerator(x, y, initiallyFilled) {
  this.cellSize = 10;
  this.cellSizeHalf = this.cellSize / 2;

  this.sizeX = x;
  this.sizeY = y;
  this.horizontalWalls = [];
  for (var i = 0; i < x; i++) {
    var ladder = [];
    for (var j = 0; j < y - 1; j++) {
      ladder.push(initiallyFilled);
    }
    this.horizontalWalls.push(ladder);
  }
  this.verticalWalls = [];
  for (var i = 0; i < x - 1; i++) {
    var pole = [];
    for (var j = 0; j < y; j++) {
      pole.push(initiallyFilled);
    }
    this.verticalWalls.push(pole);
  }
};
MazeGenerator.prototype.render = function(canvas) {
  var context = canvas.getContext("2d");
  var cellSize = this.cellSize;
  var cellSizeHalf = this.cellSizeHalf;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 100, 100);
  context.strokeStyle = "#000000";
  // horizontalWalls
  for (var i = 0; i < this.sizeX; i++) {
    var ladder = this.horizontalWalls[i];
    for (var j = -1; j < this.sizeY - 1 + 1; j++) {
      var drawIt = ladder[j];
      if (drawIt == null || drawIt === true) {
        context.beginPath();
        context.moveTo(i * cellSize + cellSize + cellSizeHalf, j * cellSize + cellSize + cellSizeHalf);
        context.lineTo(i * cellSize + cellSize - cellSizeHalf, j * cellSize + cellSize + cellSizeHalf);
        context.stroke();
      }
    }
  }
  // verticalWalls
  for (var i = -1; i < this.sizeX - 1 + 1; i++) {
    var pole = this.verticalWalls[i];
    for (var j = 0; j < this.sizeY; j++) {
      var drawIt = pole == null || pole[j];
      if (drawIt === true) {
        context.beginPath();
        context.moveTo(i * cellSize + cellSize + cellSizeHalf, j * cellSize + cellSize + cellSizeHalf);
        context.lineTo(i * cellSize + cellSize + cellSizeHalf, j * cellSize + cellSize - cellSizeHalf);
        context.stroke();
      }
    }
  }
};

function inherits(ctor, superCtor) {
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
}
