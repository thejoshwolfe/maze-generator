function ToroidalMaze(sizeX, sizeY, initialEdgeColor, initialRoomColor) {
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

ToroidalMaze.prototype.getEdgeCount = function() {
  return 2 * this.sizeX * this.sizeY;
};
ToroidalMaze.prototype.getEdgeFromLocation = function(orientation, x, y) {
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
ToroidalMaze.prototype.getEdgeLocation = function(edge) {
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

ToroidalMaze.prototype.getRoomCount = function() {
  return this.sizeX * this.sizeY;
};
ToroidalMaze.prototype.getRoomFromLocation = function(x, y) {
  x = util.euclideanMod(x, this.sizeX);
  y = util.euclideanMod(y, this.sizeY);
  return this.sizeY * x + y;
};
ToroidalMaze.prototype.getRoomLocation = function(room) {
  var x = Math.floor(room / this.sizeY);
  var y = room % this.sizeY;
  return {x:x, y:y};
};

ToroidalMaze.prototype.roomToVectors = function(room) {
  var roomLocation = this.getRoomLocation(room);
  return [
    { edge:this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x + 0, roomLocation.y + 0),
      room:this.getRoomFromLocation(roomLocation.x + 1, roomLocation.y - 0) },
    { edge:this.getEdgeFromLocation(Maze.HORIZONTAL, roomLocation.x + 0, roomLocation.y + 0),
      room:this.getRoomFromLocation(roomLocation.x + 0, roomLocation.y + 1) },
    { edge:this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x - 1, roomLocation.y + 0),
      room:this.getRoomFromLocation(roomLocation.x - 1, roomLocation.y + 0) },
    { edge:this.getEdgeFromLocation(Maze.HORIZONTAL, roomLocation.x + 0, roomLocation.y - 1),
      room:this.getRoomFromLocation(roomLocation.x - 0, roomLocation.y - 1) },
  ];
};
ToroidalMaze.prototype.edgeToRoomPair = function(edge) {
  var edgeLocation = this.getEdgeLocation(edge);
  var result = [];
  var x = edgeLocation.x;
  var y = edgeLocation.y;
  result.push(this.getRoomFromLocation(x, y));
  if (edgeLocation.orientation === Maze.HORIZONTAL) {
    // horizontal
    y += 1;
  } else {
    // vertical
    x += 1;
  }
  result.push(this.getRoomFromLocation(x, y));
  return result;
};

ToroidalMaze.prototype.getVertexCount = function() {
  return this.getRoomCount();
};
ToroidalMaze.prototype.getVertexLocation = function(vertex) {
  return this.getRoomLocation(vertex);
};
ToroidalMaze.prototype.getVertexFromLocation = function(x, y) {
  return this.getRoomFromLocation(x, y);
};
ToroidalMaze.prototype.vertexToEdges = function(vertex) {
  var vertexLocation = this.getVertexLocation(vertex);
  var x = vertexLocation.x;
  var y = vertexLocation.y;
  return [
    this.getEdgeFromLocation(Maze.VERTICAL, x, y),
    this.getEdgeFromLocation(Maze.VERTICAL, x, y + 1),
    this.getEdgeFromLocation(Maze.HORIZONTAL, x, y),
    this.getEdgeFromLocation(Maze.HORIZONTAL, x + 1, y),
  ];
};
ToroidalMaze.prototype.vertexToBranches = function(vertex) {
  var vertexLocation = this.getVertexLocation(vertex);
  var x = vertexLocation.x;
  var y = vertexLocation.y;
  var branches = [
    { vertex:this.getVertexFromLocation(x, y - 1),
      edge:this.getEdgeFromLocation(Maze.VERTICAL, x, y) },
    { vertex:this.getVertexFromLocation(x, y + 1),
      edge:this.getEdgeFromLocation(Maze.VERTICAL, x, y + 1) },
    { vertex:this.getVertexFromLocation(x - 1, y),
      edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x, y) },
    { vertex:this.getVertexFromLocation(x + 1, y),
      edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x + 1, y) },
  ];
  return branches;
};
ToroidalMaze.prototype.getBorderBranches = function() {
  // there's no border
  return [];
};


ToroidalMaze.prototype.makeRenderer = function(canvas) {
  return new ToroidalMazeRenderer(canvas, this.sizeX, this.sizeY);
};


function ToroidalMazeRenderer(canvas, sizeX, sizeY) {
  this.canvas = canvas;
  this.sizeX = sizeX;
  this.sizeY = sizeY;
  this.cellSize = 10;
  this.tessellationOffsetX = this.cellSize/2;
  this.tessellationOffsetY = this.cellSize/2;
  canvas.width = (sizeX + 1) * this.cellSize;
  canvas.height = (sizeY + 1) * this.cellSize;
}

ToroidalMazeRenderer.prototype.render = function(maze) {
  var context = this.canvas.getContext("2d");
  var cellSize = this.cellSize;
  var canvasWidth = this.canvas.width;
  var canvasHeight = this.canvas.height;
  var tessellationOffsetX = this.tessellationOffsetX;
  var tessellationOffsetY = this.tessellationOffsetY;
  var tessellationMinX = -1;
  var tessellationMaxX = 1;
  var tessellationMinY = -1;
  var tessellationMaxY = 1;

  // roomColors
  var roomCount = maze.getRoomCount();
  for (var i = 0; i < roomCount; i++) {
    var color = maze.roomColors[i];
    if (color === Maze.OPEN) continue;
    var roomLocation = maze.getRoomLocation(i);
    context.fillStyle = color;
    for (var tessellationIndexX = tessellationMinX; tessellationIndexX <= tessellationMaxX; tessellationIndexX++) {
      for (var tessellationIndexY = tessellationMinY; tessellationIndexY <= tessellationMaxY; tessellationIndexY++) {
        var x = roomLocation.x + tessellationIndexX * this.sizeX;
        var y = roomLocation.y + tessellationIndexY * this.sizeY;
        context.fillRect(tessellationOffsetX + x * cellSize, tessellationOffsetY + y * cellSize, cellSize, cellSize);
      }
    }
  }

  // edges
  var edgeCount = maze.getEdgeCount();
  for (var i = 0; i < edgeCount; i++) {
    var color = maze.edgeColors[i];
    if (color === Maze.OPEN) continue;
    var edgeLocation = maze.getEdgeLocation(i);
    context.strokeStyle = color;
    context.beginPath();
    for (var tessellationIndexX = tessellationMinX; tessellationIndexX <= tessellationMaxX; tessellationIndexX++) {
      for (var tessellationIndexY = tessellationMinY; tessellationIndexY <= tessellationMaxY; tessellationIndexY++) {
        var x = edgeLocation.x + tessellationIndexX * this.sizeX;
        var y = edgeLocation.y + tessellationIndexY * this.sizeY;
        var pixelX = tessellationOffsetX + (x + 1) * cellSize;
        var pixelY = tessellationOffsetY + (y + 1) * cellSize;
        if (-cellSize <= pixelX && pixelX <= canvasWidth + cellSize &&
            -cellSize <= pixelY && pixelY <= canvasHeight + cellSize) {
          if (edgeLocation.orientation === Maze.HORIZONTAL) {
            context.moveTo(pixelX - cellSize, pixelY);
          } else {
            context.moveTo(pixelX, pixelY - cellSize);
          }
          context.lineTo(pixelX, pixelY);
        }
      }
    }
    context.stroke();
  }
};

ToroidalMazeRenderer.prototype.zoom = function(delta, anchorX, anchorY) {
  return; // TODO
  var newCellSize = this.cellSize * Math.pow(2, Math.sign(delta)/-10);
  this.cellSize = Math.max(5, Math.min(newCellSize, 20));
};

ToroidalMazeRenderer.prototype.getRoomLocationFromPixelLocation = function(mouseX, mouseY) {
  var x = Math.floor((mouseX - this.tessellationOffsetX) / this.cellSize);
  var y = Math.floor((mouseY - this.tessellationOffsetY) / this.cellSize);
  // have to bounds check here, because getRoomFromLocation won't
  if (x < 0 || x >= this.sizeX) return null;
  if (y < 0 || y >= this.sizeY) return null;
  return {x:x, y:y};
};
