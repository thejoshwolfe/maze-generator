util.inherits(TorusMaze, Maze);
function TorusMaze(sizeX, sizeY, initialEdgeColor, initialRoomColor) {
  this.sizeX = sizeX;
  this.sizeY = sizeY;

  this.edgeColors = [];
  var edgeCount = this.getEdgeCount();
  for (var i = 0; i < edgeCount; i++) {
    this.edgeColors.push(initialEdgeColor);
  }

  this.roomColors = [];
  var roomCount = this.getRoomCount()
  for (var i = 0; i < roomCount; i++) {
    this.roomColors[i] = initialRoomColor;
  }
}

TorusMaze.prototype.getEdgeCount = function() {
  return 2 * this.sizeX * this.sizeY;
};
TorusMaze.prototype.getEdgeFromLocation = function(orientation, x, y) {
  x = util.euclideanMod(x, this.sizeX);
  y = util.euclideanMod(y, this.sizeY);
  if (orientation === Maze.HORIZONTAL) {
    // horizontal
    return x * this.sizeY + y;
  } else {
    // vertical
    var horizontalEdgeCount = this.sizeX * this.sizeY;
    return horizontalEdgeCount + x * this.sizeY + y;
  }
};
TorusMaze.prototype.getEdgeLocation = function(edge) {
  var orientation;
  var x;
  var y;
  var horizontalEdgeCount = this.sizeX * this.sizeY;
  if (edge < horizontalEdgeCount) {
    orientation = Maze.HORIZONTAL;
    x = Math.floor(edge / this.sizeY);
    y = edge % this.sizeY;
  } else {
    edge -= horizontalEdgeCount;
    orientation = Maze.VERTICAL;
    x = Math.floor(edge / this.sizeY);
    y = edge % this.sizeY;
  }
  return {orientation:orientation, x:x, y:y};
};

TorusMaze.prototype.getRoomFromLocation = function(x, y) {
  x = util.euclideanMod(x, this.sizeX);
  y = util.euclideanMod(y, this.sizeY);
  return this.sizeY * x + y;
};

TorusMaze.prototype.roomToVectors = function(room) {
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
};

TorusMaze.prototype.getVertexCount = function() {
  return this.getRoomCount();
};
TorusMaze.prototype.getVertexLocation = function(vertex) {
  return this.getRoomLocation(vertex);
};
TorusMaze.prototype.getVertexFromLocation = function(x, y) {
  return this.getRoomFromLocation(x, y);
};
TorusMaze.prototype.vertexToBranches = function(vertex) {
  var vertexLocation = this.getVertexLocation(vertex);
  var x = vertexLocation.x;
  var y = vertexLocation.y;
  var branches = [
    { vertex:this.getVertexFromLocation(             x + 1, y    ),
      edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x + 1, y    ) },
    { vertex:this.getVertexFromLocation(             x - 1, y    ),
      edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x - 0, y    ) },
    { vertex:this.getVertexFromLocation(             x    , y + 1),
      edge:this.getEdgeFromLocation(Maze.VERTICAL,   x    , y + 1) },
    { vertex:this.getVertexFromLocation(             x    , y - 1),
      edge:this.getEdgeFromLocation(Maze.VERTICAL,   x    , y - 0) },
  ];
  return branches;
};
TorusMaze.prototype.getBorderBranches = function() {
  // there's no border
  return [];
};


TorusMaze.prototype.makeRenderer = function(canvas) {
  return new TorusMazeRenderer(canvas, this.sizeX, this.sizeY);
};


util.inherits(TorusMazeRenderer, MazeRenderer);
function TorusMazeRenderer(canvas, sizeX, sizeY) {
  MazeRenderer.call(this, canvas, sizeX, sizeY);
  this.tessellationMinX = -1;
  this.tessellationMaxX = 1;
  this.tessellationMinY = -1;
  this.tessellationMaxY = 1;
}

TorusMazeRenderer.prototype.renderBorders = function(maze) {
  // no borders
};

TorusMazeRenderer.prototype.scroll = function(deltaX, deltaY) {
  this.tessellationOffsetX = util.euclideanMod(this.tessellationOffsetX + deltaX, this.sizeX * this.cellSize);
  this.tessellationOffsetY = util.euclideanMod(this.tessellationOffsetY + deltaY, this.sizeY * this.cellSize);
};

TorusMazeRenderer.prototype.getRoomLocationFromPixelLocation = function(mouseX, mouseY) {
  var x = Math.floor(util.euclideanMod(mouseX - this.tessellationOffsetX, this.sizeX * this.cellSize) / this.cellSize);
  var y = Math.floor(util.euclideanMod(mouseY - this.tessellationOffsetY, this.sizeY * this.cellSize) / this.cellSize);
  return {x:x, y:y};
};
