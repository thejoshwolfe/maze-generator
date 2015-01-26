util.inherits(CylinderMaze, Maze);
function CylinderMaze(sizeX, sizeY, initialEdgeColor, initialRoomColor) {
  Maze.call(this, sizeX, sizeY, initialEdgeColor, initialRoomColor);
}

CylinderMaze.prototype.getEdgeCount = function() {
  return this.sizeX * (this.sizeY - 1) + this.sizeX * this.sizeY;
};
CylinderMaze.prototype.getEdgeFromLocation = function(orientation, x, y) {
  x = util.euclideanMod(x, this.sizeX);
  if (orientation === Maze.HORIZONTAL) {
    // horizontal
    return x * (this.sizeY - 1) + y;
  } else {
    // vertical
    var horizontalEdgeCount = this.sizeX * (this.sizeY - 1);
    return horizontalEdgeCount + x * this.sizeY + y;
  }
};
CylinderMaze.prototype.getEdgeLocation = function(edge) {
  var orientation;
  var x;
  var y;
  var horizontalEdgeCount = this.sizeX * (this.sizeY - 1);
  if (edge < horizontalEdgeCount) {
    orientation = Maze.HORIZONTAL;
    x = Math.floor(edge / (this.sizeY - 1));
    y = edge % (this.sizeY - 1);
  } else {
    edge -= horizontalEdgeCount;
    orientation = Maze.VERTICAL;
    x = Math.floor(edge / this.sizeY);
    y = edge % this.sizeY;
  }
  return {orientation:orientation, x:x, y:y};
};

CylinderMaze.prototype.getRoomFromLocation = function(x, y) {
  x = util.euclideanMod(x, this.sizeX);
  return this.sizeY * x + y;
};

CylinderMaze.prototype.roomToVectors = function(room) {
  var roomLocation = this.getRoomLocation(room);
  var vectors = [
    // these are certain
    { edge:this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x + 0, roomLocation.y    ),
      room:this.getRoomFromLocation(                 roomLocation.x + 1, roomLocation.y    ) },
    { edge:this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x - 1, roomLocation.y    ),
      room:this.getRoomFromLocation(                 roomLocation.x - 1, roomLocation.y    ) },
  ];

  var edges = [
    this.getEdgeFromLocation(Maze.HORIZONTAL, roomLocation.x, roomLocation.y + 0),
    this.getEdgeFromLocation(Maze.HORIZONTAL, roomLocation.x, roomLocation.y - 1),
  ];
  var neighborLocations = [
    {x:roomLocation.x, y:roomLocation.y + 1},
    {x:roomLocation.x, y:roomLocation.y - 1},
  ];
  for (var i = 0; i < neighborLocations.length; i++) {
    var neighborLocation = neighborLocations[i];
    // bounds check
    if (neighborLocation.y < 0 || neighborLocation.y >= this.sizeY) continue;
    var neighbor = this.getRoomFromLocation(neighborLocation.x, neighborLocation.y);
    vectors.push({edge:edges[i], room:neighbor});
  }
  return vectors;
};

CylinderMaze.prototype.getVertexCount = function() {
  return this.sizeX * (this.sizeY - 1);
};
CylinderMaze.prototype.getVertexFromLocation = function(x, y) {
  x = util.euclideanMod(x, this.sizeX);
  return (this.sizeY - 1) * x + y;
};
CylinderMaze.prototype.vertexToBranches = function(vertex) {
  var vertexLocation = this.getVertexLocation(vertex);
  var x = vertexLocation.x;
  var y = vertexLocation.y;
  var branches = [
    // these are certain
    { vertex:this.getVertexFromLocation(             x + 1, y    ),
      edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x + 1, y    ) },
    { vertex:this.getVertexFromLocation(             x - 1, y    ),
      edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x - 0, y    ) },
  ];
  if (y < this.sizeY - 2) {
    branches.push({
      vertex:this.getVertexFromLocation(x, y + 1),
      edge:this.getEdgeFromLocation(Maze.VERTICAL, x, y + 1),
    });
  }
  if (y > 0) {
    branches.push({
      vertex:this.getVertexFromLocation(x, y - 1),
      edge:this.getEdgeFromLocation(Maze.VERTICAL, x, y),
    });
  }
  return branches;
};
CylinderMaze.prototype.getBorderBranches = function() {
  // only vertical branches from the border
  var branches = [];
  if (this.sizeY > 1) {
    for (var x = 0; x < this.sizeX - 2; x++) {
      branches.push({
        vertex:this.getVertexFromLocation(x, 0),
        edge:this.getEdgeFromLocation(Maze.VERTICAL, x, 0),
      });
      branches.push({
        vertex:this.getVertexFromLocation(x, this.sizeY - 2),
        edge:this.getEdgeFromLocation(Maze.VERTICAL, x, this.sizeY - 1),
      });
    }
  }
  return branches;
};


CylinderMaze.prototype.makeRenderer = function(canvas) {
  return new CylinderMazeRenderer(canvas, this.sizeX, this.sizeY);
};


util.inherits(CylinderMazeRenderer, MazeRenderer);
function CylinderMazeRenderer(canvas, sizeX, sizeY) {
  MazeRenderer.call(this, canvas, sizeX, sizeY);
  this.tessellationMinX = -1;
  this.tessellationMaxX = 1;
}

CylinderMazeRenderer.prototype.renderBorders = function(maze) {
  var self = this;
  var context = self.canvas.getContext("2d");
  var cellSize = self.cellSize;
  var cellSizeHalf = cellSize / 2;
  var wallThickness = self.wallThickness;
  var wallThicknessHalf = wallThickness / 2;
  context.fillStyle = Maze.FILLED;
  [cellSizeHalf, cellSizeHalf + self.sizeY * self.cellSize].forEach(function(y) {
    context.fillRect(0, y - wallThicknessHalf, self.canvas.width, wallThickness);
  });
};

CylinderMazeRenderer.prototype.scroll = function(deltaX, deltaY) {
  this.tessellationOffsetX = util.euclideanMod(this.tessellationOffsetX + deltaX, this.sizeX * this.cellSize);
};

CylinderMazeRenderer.prototype.getRoomLocationFromPixelLocation = function(mouseX, mouseY) {
  var x = Math.floor(util.euclideanMod(mouseX - this.tessellationOffsetX, this.sizeX * this.cellSize) / this.cellSize);
  var y = Math.floor((mouseY - this.tessellationOffsetY) / this.cellSize);
  if (y < 0 || y >= this.sizeY) return null;
  return {x:x, y:y};
};
