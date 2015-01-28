// the outdoor room is the last index
util.inherits(OutdoorMaze, Maze);
function OutdoorMaze(sizeX, sizeY, options) {
  Maze.call(this, sizeX, sizeY, options);
  this.outdoorRoom = sizeX * sizeY;
}

OutdoorMaze.prototype.getEdgeCount = function() {
  return this.sizeX * (this.sizeY + 1) + (this.sizeX + 1) * this.sizeY;
};
OutdoorMaze.prototype.getEdgeFromLocation = function(orientation, x, y) {
  if (orientation === Maze.HORIZONTAL) {
    // horizontal
    return x * (this.sizeY + 1) + y + 1;
  } else {
    // vertical
    var horizontalEdgeCount = this.sizeX * (this.sizeY + 1);
    return horizontalEdgeCount + (x + 1) * this.sizeY + y;
  }
};
OutdoorMaze.prototype.getEdgeLocation = function(edge) {
  var horizontalEdgeCount = this.sizeX * (this.sizeY + 1);
  if (edge < horizontalEdgeCount) {
    return {
      orientation: Maze.HORIZONTAL,
      x: Math.floor(edge / (this.sizeY + 1)),
      y: edge % (this.sizeY + 1) - 1,
    };
  } else {
    edge -= horizontalEdgeCount;
    return {
      orientation: Maze.VERTICAL,
      x: Math.floor(edge / this.sizeY) - 1,
      y: edge % this.sizeY,
    };
  }
};

OutdoorMaze.prototype.getRoomCount = function() {
  return this.sizeX * this.sizeY + 1;
};
OutdoorMaze.prototype.getRoomFromLocation = function(x, y) {
  // out of bounds is outdoors
  if (x < 0 || x >= this.sizeX ||
      y < 0 || y >= this.sizeY) {
    return this.outdoorRoom;
  }
  return this.sizeY * x + y;
};
OutdoorMaze.prototype.getRoomLocation = function(room) {
  // the official "location" of the outdoors room is where you'd expect it's upper-left corner.
  if (room === this.outdoorRoom) return {x:-1, y:-1};
  return Maze.prototype.getRoomLocation.call(this, room);
};

OutdoorMaze.prototype.getVertexCount = function() {
  return (this.sizeX + 1) * (this.sizeY + 1);
};
OutdoorMaze.prototype.getVertexLocation = function(vertex) {
  var x = Math.floor(vertex / (this.sizeY + 1)) - 1;
  var y = vertex % (this.sizeY + 1) - 1;
  return {x:x, y:y};
};
OutdoorMaze.prototype.getVertexFromLocation = function(x, y) {
  return (this.sizeY + 1) * (x + 1) + (y + 1);
};

OutdoorMaze.prototype.roomToVectors = function(room) {
  if (room === this.outdoorRoom) {
    // come in from the border
    var result = [];
    // top and bottom
    for (var x = 0; x < this.sizeX; x++) {
      result.push({
        edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x, -1),
        room:this.getRoomFromLocation(x, 0),
      });
      result.push({
        edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x, this.sizeY),
        room:this.getRoomFromLocation(x, this.sizeY - 1),
      });
    }
    // left and right
    for (var y = 0; y < this.sizeY; y++) {
      result.push({
        edge:this.getEdgeFromLocation(Maze.VERTICAL, -1, y),
        room:this.getRoomFromLocation(0, y),
      });
      result.push({
        edge:this.getEdgeFromLocation(Maze.VERTICAL, this.sizeX, y),
        room:this.getRoomFromLocation(this.sizeX - 1, y),
      });
    }
    return result;
  } else {
    var roomLocation = this.getRoomLocation(room);
    return [
      { edge:this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x + 0, roomLocation.y    ),
        room:this.getRoomFromLocation(                 roomLocation.x + 1, roomLocation.y    ) },
      { edge:this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x - 1, roomLocation.y    ),
        room:this.getRoomFromLocation(                 roomLocation.x - 1, roomLocation.y    ) },
      { edge:this.getEdgeFromLocation(Maze.HORIZONTAL, roomLocation.x    , roomLocation.y + 0),
        room:this.getRoomFromLocation(                 roomLocation.x    , roomLocation.y + 1) },
      { edge:this.getEdgeFromLocation(Maze.HORIZONTAL, roomLocation.x    , roomLocation.y - 1),
        room:this.getRoomFromLocation(                 roomLocation.x    , roomLocation.y - 1) },
    ];
  }
};

OutdoorMaze.prototype.makeRenderer = function(canvas) {
  return new OutdoorMazeRenderer(canvas, this.sizeX, this.sizeY);
};

util.inherits(OutdoorMazeRenderer, MazeRenderer);
function OutdoorMazeRenderer(canvas, sizeX, sizeY) {
  MazeRenderer.call(this, canvas, sizeX, sizeY);
}

OutdoorMazeRenderer.prototype.renderBorders = function(maze) {
  // borders are first-class objects
};
OutdoorMazeRenderer.prototype.getRoomLocationFromPixelLocation = function(mouseX, mouseY) {
  var cellSizeHalf = this.cellSize / 2;
  var x = Math.floor((mouseX - cellSizeHalf) / this.cellSize);
  var y = Math.floor((mouseY - cellSizeHalf) / this.cellSize);
  // don't bounds check here.
  // getRoomFromLocation will return the outdoor room.
  return {x:x, y:y};
};
