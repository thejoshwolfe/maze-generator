function MazeRenderer(canvas, sizeX, sizeY) {
  this.canvas = canvas;
  this.sizeX = sizeX;
  this.sizeY = sizeY;
  this.setCellSize(10);
}
MazeRenderer.prototype.setCellSize = function(cellSize) {
  this.cellSize = cellSize;
  this.canvas.width = (this.sizeX + 1) * this.cellSize;
  this.canvas.height = (this.sizeY + 1) * this.cellSize;
};

MazeRenderer.prototype.render = function(maze) {
  var context = this.canvas.getContext("2d");
  var cellSize = this.cellSize;
  var cellSizeHalf = cellSize / 2;

  // roomColors
  for (var x = 0; x < this.sizeX; x++) {
    for (var y = 0; y < this.sizeY; y++) {
      var color = maze.roomColors[maze.getRoomFromLocation(x, y)];
      if (color !== Maze.OPEN) {
        context.fillStyle = color;
        context.fillRect(x * cellSize + cellSize - cellSizeHalf, y * cellSize + cellSize - cellSizeHalf, cellSize, cellSize);
      }
    }
  }

  // edges
  // horizontal
  for (var i = 0; i < this.sizeX; i++) {
    for (var j = -1; j < this.sizeY - 1 + 1; j++) {
      var color;
      if (0 <= j && j < this.sizeY - 1) {
        // in bounds
        color = maze.edgeColors[maze.getEdgeFromLocation(Maze.HORIZONTAL, i, j)];
      } else {
        // the border
        color = Maze.FILLED;
      }
      if (color !== Maze.OPEN) {
        context.strokeStyle = color;
        context.beginPath();
        context.moveTo(i * cellSize + cellSize + cellSizeHalf, j * cellSize + cellSize + cellSizeHalf);
        context.lineTo(i * cellSize + cellSize - cellSizeHalf, j * cellSize + cellSize + cellSizeHalf);
        context.stroke();
      }
    }
  }
  // vertical
  for (var i = -1; i < this.sizeX - 1 + 1; i++) {
    for (var j = 0; j < this.sizeY; j++) {
      var color;
      if (0 <= i && i < this.sizeX - 1) {
        // in bounds
        color = maze.edgeColors[maze.getEdgeFromLocation(Maze.VERTICAL, i, j)];
      } else {
        // the border
        color = Maze.FILLED;
      }
      if (color !== Maze.OPEN) {
        context.strokeStyle = color;
        context.beginPath();
        context.moveTo(i * cellSize + cellSize + cellSizeHalf, j * cellSize + cellSize + cellSizeHalf);
        context.lineTo(i * cellSize + cellSize + cellSizeHalf, j * cellSize + cellSize - cellSizeHalf);
        context.stroke();
      }
    }
  }
};
MazeRenderer.prototype.zoom = function(delta, anchorX, anchorY) {
  var newCellSize = this.cellSize * Math.pow(2, Math.sign(delta)/-10);
  this.setCellSize(Math.max(5, Math.min(newCellSize, 20)));
};

MazeRenderer.prototype.getRoomLocationFromPixelLocation = function(mouseX, mouseY) {
  var cellSizeHalf = this.cellSize / 2;
  var x = Math.floor((mouseX - cellSizeHalf) / this.cellSize);
  var y = Math.floor((mouseY - cellSizeHalf) / this.cellSize);
  // have to bounds check here, because getRoomFromLocation won't
  if (x < 0 || x >= this.sizeX) return null;
  if (y < 0 || y >= this.sizeY) return null;
  return {x:x, y:y};
};
