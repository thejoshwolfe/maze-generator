
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

MazeGenerator.prototype.getWallCount = function() {
  return this.sizeX * (this.sizeY - 1) + (this.sizeX - 1) * this.sizeY;
};
MazeGenerator.prototype.wallToScalar = function(wallsArray, i, j) {
  if (wallsArray === this.horizontalWalls) {
    // horizontalWalls
    return i * (this.sizeY - 1) + j;
  } else {
    // verticalWalls
    var horizontalWallsSize = this.sizeX * (this.sizeY - 1);
    return horizontalWallsSize + i * this.sizeY + j;
  }
};
MazeGenerator.prototype.scalarToWall = function(scalar) {
  var result = {};
  var horizontalWallsSize = this.sizeX * (this.sizeY - 1);
  if (scalar < horizontalWallsSize) {
    result.wallsArray = this.horizontalWalls;
    result.i = Math.floor(scalar / (this.sizeY - 1));
    result.j = scalar % (this.sizeY - 1);
  } else {
    scalar -= horizontalWallsSize;
    result.wallsArray = this.verticalWalls;
    result.i = Math.floor(scalar / this.sizeY);
    result.j = scalar % this.sizeY;
  }
  return result;
};

MazeGenerator.prototype.getRoomCount = function() {
  return this.sizeX * this.sizeY;
};
MazeGenerator.prototype.roomToScalar = function(x, y) {
  return this.sizeY * x + y;
};
MazeGenerator.prototype.scalarToRoom = function(scalar) {
  var x = Math.floor(scalar / this.sizeY);
  var y = scalar % this.sizeY;
  return {x:x, y:y};
};

MazeGenerator.prototype.render = function(canvas) {
  var context = canvas.getContext("2d");
  var cellSize = this.cellSize;
  var cellSizeHalf = this.cellSizeHalf;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
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
