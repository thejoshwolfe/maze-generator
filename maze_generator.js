
MazeGenerator.FILLED = "#000000";
MazeGenerator.OPEN = "#ffffff";
function MazeGenerator(x, y, initialWallColor, initialRoomColor) {
  this.cellSize = 10;
  this.cellSizeHalf = this.cellSize / 2;

  this.sizeX = x;
  this.sizeY = y;
  this.horizontalWallColors = [];
  for (var i = 0; i < x; i++) {
    var ladder = [];
    for (var j = 0; j < y - 1; j++) {
      ladder.push(initialWallColor);
    }
    this.horizontalWallColors.push(ladder);
  }
  this.verticalWallColors = [];
  for (var i = 0; i < x - 1; i++) {
    var pole = [];
    for (var j = 0; j < y; j++) {
      pole.push(initialWallColor);
    }
    this.verticalWallColors.push(pole);
  }
  this.roomColors = [];
  for (var x = 0; x < this.sizeX; x++) {
    var column = [];
    for (var y = 0; y < this.sizeY; y++) {
      column.push(initialRoomColor);
    }
    this.roomColors.push(column);
  }
};

MazeGenerator.prototype.getWallCount = function() {
  return this.sizeX * (this.sizeY - 1) + (this.sizeX - 1) * this.sizeY;
};
MazeGenerator.prototype.wallToScalar = function(wallsArray, i, j) {
  if (wallsArray === this.horizontalWallColors) {
    // horizontalWallColors
    return i * (this.sizeY - 1) + j;
  } else {
    // verticalWallColors
    var horizontalWallsSize = this.sizeX * (this.sizeY - 1);
    return horizontalWallsSize + i * this.sizeY + j;
  }
};
MazeGenerator.prototype.scalarToWall = function(scalar) {
  var wallsArray;
  var i;
  var j;
  var horizontalWallsSize = this.sizeX * (this.sizeY - 1);
  if (scalar < horizontalWallsSize) {
    wallsArray = this.horizontalWallColors;
    i = Math.floor(scalar / (this.sizeY - 1));
    j = scalar % (this.sizeY - 1);
  } else {
    scalar -= horizontalWallsSize;
    wallsArray = this.verticalWallColors;
    i = Math.floor(scalar / this.sizeY);
    j = scalar % this.sizeY;
  }
  return {wallsArray:wallsArray, i:i, j:j};
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

MazeGenerator.prototype.getCanvasWidth = function() {
  return (this.sizeX + 1) * this.cellSize;
};
MazeGenerator.prototype.getCanvasHeight = function() {
  return (this.sizeY + 1) * this.cellSize;
};
MazeGenerator.prototype.render = function(canvas) {
  var context = canvas.getContext("2d");
  var cellSize = this.cellSize;
  var cellSizeHalf = this.cellSizeHalf;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // roomColors
  for (var x = 0; x < this.sizeX; x++) {
    for (var y = 0; y < this.sizeY; y++) {
      var color = this.roomColors[x][y];
      if (color !== MazeGenerator.OPEN) {
        context.fillStyle = color;
        context.fillRect(x * cellSize + cellSize - cellSizeHalf, y * cellSize + cellSize - cellSizeHalf, cellSize, cellSize);
      }
    }
  }

  // walls
  // horizontalWallColors
  for (var i = 0; i < this.sizeX; i++) {
    var ladder = this.horizontalWallColors[i];
    for (var j = -1; j < this.sizeY - 1 + 1; j++) {
      var drawIt = ladder[j];
      if (drawIt == null || drawIt === MazeGenerator.FILLED) {
        context.strokeStyle = "#000000";
        context.beginPath();
        context.moveTo(i * cellSize + cellSize + cellSizeHalf, j * cellSize + cellSize + cellSizeHalf);
        context.lineTo(i * cellSize + cellSize - cellSizeHalf, j * cellSize + cellSize + cellSizeHalf);
        context.stroke();
      }
    }
  }
  // verticalWallColors
  for (var i = -1; i < this.sizeX - 1 + 1; i++) {
    var pole = this.verticalWallColors[i];
    for (var j = 0; j < this.sizeY; j++) {
      var drawIt = pole == null ? MazeGenerator.FILLED : pole[j];
      if (drawIt === MazeGenerator.FILLED) {
        context.beginPath();
        context.moveTo(i * cellSize + cellSize + cellSizeHalf, j * cellSize + cellSize + cellSizeHalf);
        context.lineTo(i * cellSize + cellSize + cellSizeHalf, j * cellSize + cellSize - cellSizeHalf);
        context.stroke();
      }
    }
  }
};
