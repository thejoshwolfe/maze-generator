function MazeRenderer(canvas, topology, sizeX, sizeY) {
  this.canvas = canvas;
  this.topology = topology;
  this.sizeX = sizeX;
  this.sizeY = sizeY;
  var cellSizeByZoom = 1000 / Math.max(sizeX, sizeY);
  var clampedCellSize = Math.max(10, Math.min(32, cellSizeByZoom));
  // make it an integer multiple of 2, or else the rendering has seems.
  this.cellSize = clampedCellSize >> 1 << 1;
  // wall thickness is at least 2, and also an even integer.
  this.wallThickness = Math.max(this.cellSize / 5, 2) >> 1 << 1;
  this.tessellationOffsetX = this.cellSize/2;
  this.tessellationOffsetY = this.cellSize/2;
  this.tessellationMinX = 0;
  this.tessellationMaxX = 0;
  this.tessellationMinY = 0;
  this.tessellationMaxY = 0;
  canvas.width = (sizeX + 1) * this.cellSize;
  canvas.height = (sizeY + 1) * this.cellSize;

  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE:
    case Maze.TOPOLOGY_OUTDOOR:
      break;
    case Maze.TOPOLOGY_CYLINDER:
      this.tessellationMinX = -1;
      this.tessellationMaxX = 1;
      break;
    case Maze.TOPOLOGY_TORUS:
      this.tessellationMinX = -1;
      this.tessellationMaxX = 1;
      this.tessellationMinY = -1;
      this.tessellationMaxY = 1;
      break;
    case Maze.TOPOLOGY_MOBIUS:
      this.tessellationMinX = -2;
      this.tessellationMaxX = 2;
      break;
    default: throw Error();
  }
}

MazeRenderer.prototype.render = function(maze, options) {
  if (options == null) options = {};
  var context = this.canvas.getContext("2d");
  var sizeX = this.sizeX;
  var sizeY = this.sizeY;
  var cellSize = this.cellSize;
  var cellSizeHalf = cellSize / 2;
  var wallThickness = this.wallThickness;
  var wallThicknessHalf = wallThickness / 2;
  var canvasWidth = this.canvas.width;
  var canvasHeight = this.canvas.height;
  var tessellationOffsetX = this.tessellationOffsetX;
  var tessellationOffsetY = this.tessellationOffsetY;

  // roomColors
  var roomSpacing = options.roomSpacing != null ? options.roomSpacing : wallThickness;
  var roomCount = maze.getRoomCount();
  for (var i = 0; i < roomCount; i++) {
    var color = maze.roomColors[i];
    if (color === Maze.OPEN) continue;
    context.fillStyle = color;
    if (i === maze.outdoorRoom) {
      // horizontal borders cover the corners
      [-cellSizeHalf, cellSizeHalf + sizeY * cellSize].forEach(function(y) {
        context.fillRect(-cellSizeHalf + roomSpacing/2, y + roomSpacing/2,
                         (sizeX + 2) * cellSize - roomSpacing, cellSize - roomSpacing);
      });
      // vertical borders do not cover the corners
      [-cellSizeHalf, cellSizeHalf + sizeX * cellSize].forEach(function(x) {
        context.fillRect(x + roomSpacing/2, cellSizeHalf - roomSpacing/2,
                         cellSize - roomSpacing, sizeY * cellSize + roomSpacing);
      });
    } else {
      var roomLocation = maze.getRoomLocation(i);
      for (var tessellationIndexX = this.tessellationMinX; tessellationIndexX <= this.tessellationMaxX; tessellationIndexX++) {
        for (var tessellationIndexY = this.tessellationMinY; tessellationIndexY <= this.tessellationMaxY; tessellationIndexY++) {
          var tessellatedRoomLocation = this.getTessellatedRoomLocation(roomLocation.x, roomLocation.y, tessellationIndexX, tessellationIndexY);
          var x = tessellatedRoomLocation.x;
          var y = tessellatedRoomLocation.y;
          var pixelX = tessellationOffsetX + x * cellSize;
          var pixelY = tessellationOffsetY + y * cellSize;
          if (-cellSize <= pixelX && pixelX <= canvasWidth + cellSize &&
              -cellSize <= pixelY && pixelY <= canvasHeight + cellSize) {
            context.fillRect(pixelX + roomSpacing/2, pixelY + roomSpacing/2,
                             cellSize - roomSpacing, cellSize - roomSpacing);
          }
        }
      }
    }
  }

  // edges
  var edgeThickness = options.edgeThickness != null ? options.edgeThickness : wallThickness;
  var edgeThicknessHalf = edgeThickness / 2;
  var edgeCount = maze.getEdgeCount();
  for (var i = 0; i < edgeCount; i++) {
    var color = maze.edgeColors[i];
    if (color === Maze.OPEN) continue;
    var edgeLocation = maze.getEdgeLocation(i);
    context.fillStyle = color;
    for (var tessellationIndexX = this.tessellationMinX; tessellationIndexX <= this.tessellationMaxX; tessellationIndexX++) {
      for (var tessellationIndexY = this.tessellationMinY; tessellationIndexY <= this.tessellationMaxY; tessellationIndexY++) {
        var tessellatedEdgeLocation = this.getTessellatedEdgeLocation(edgeLocation.x, edgeLocation.y, edgeLocation.orientation, tessellationIndexX, tessellationIndexY);
        var x = tessellatedEdgeLocation.x;
        var y = tessellatedEdgeLocation.y;
        var pixelX = tessellationOffsetX + (x + 1) * cellSize;
        var pixelY = tessellationOffsetY + (y + 1) * cellSize;
        if (-cellSize <= pixelX && pixelX <= canvasWidth + cellSize &&
            -cellSize <= pixelY && pixelY <= canvasHeight + cellSize) {
          if (edgeLocation.orientation === Maze.HORIZONTAL) {
            context.fillRect(pixelX - cellSize + edgeThicknessHalf, pixelY - edgeThicknessHalf,
                             cellSize - edgeThickness, edgeThickness);
          } else {
            context.fillRect(pixelX - edgeThicknessHalf, pixelY - cellSize + edgeThicknessHalf,
                             edgeThickness, cellSize - edgeThickness);
          }
        }
      }
    }
  }

  this.renderBorders(maze);

  // vertex colors
  var vertexThickness = options.vertexThickness != null ? options.vertexThickness : wallThickness;
  var vertexThicknessHalf = vertexThickness / 2;
  var vertexCount = maze.getVertexCount();
  for (var i = 0; i < vertexCount; i++) {
    var color = maze.vertexColors[i];
    if (color === Maze.OPEN) continue;
    var vertexLocation = maze.getVertexLocation(i);
    context.fillStyle = color;
    for (var tessellationIndexX = this.tessellationMinX; tessellationIndexX <= this.tessellationMaxX; tessellationIndexX++) {
      for (var tessellationIndexY = this.tessellationMinY; tessellationIndexY <= this.tessellationMaxY; tessellationIndexY++) {
        var tessellatedVertexLocation = this.getTessellatedVertexLocation(vertexLocation.x, vertexLocation.y, tessellationIndexX, tessellationIndexY);
        var x = tessellatedVertexLocation.x;
        var y = tessellatedVertexLocation.y;
        var pixelX = tessellationOffsetX + (x + 1) * cellSize;
        var pixelY = tessellationOffsetY + (y + 1) * cellSize;
        if (-cellSize <= pixelX && pixelX <= canvasWidth + cellSize &&
            -cellSize <= pixelY && pixelY <= canvasHeight + cellSize) {
          context.fillRect(pixelX - vertexThicknessHalf, pixelY - vertexThicknessHalf, vertexThickness, vertexThickness);
        }
      }
    }
  }
};

MazeRenderer.prototype.renderBorders = function(maze) {
  var self = this;
  var context = self.canvas.getContext("2d");
  var cellSize = self.cellSize;
  var cellSizeHalf = cellSize / 2;
  var wallThickness = self.wallThickness;
  var wallThicknessHalf = wallThickness / 2;
  context.fillStyle = Maze.FILLED;
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE:
      // horizontal borders cover the corners
      [cellSizeHalf, cellSizeHalf + self.sizeY * self.cellSize].forEach(function(y) {
        context.fillRect(cellSizeHalf - wallThicknessHalf, y - wallThicknessHalf,
                         self.sizeX * cellSize + wallThickness, wallThickness);
      });
      // vertical borders do not cover the corners
      [cellSizeHalf, cellSizeHalf + self.sizeX * self.cellSize].forEach(function(x) {
        context.fillRect(x - wallThicknessHalf, cellSizeHalf + wallThicknessHalf,
                         wallThickness, self.sizeY * cellSize - wallThickness);
      });
      break;
    case Maze.TOPOLOGY_OUTDOOR:
    case Maze.TOPOLOGY_TORUS:
      break;
    case Maze.TOPOLOGY_CYLINDER:
    case Maze.TOPOLOGY_MOBIUS:
      [cellSizeHalf, cellSizeHalf + self.sizeY * self.cellSize].forEach(function(y) {
        context.fillRect(0, y - wallThicknessHalf, self.canvas.width, wallThickness);
      });
      break;
    default: throw Error();
  }
};

MazeRenderer.prototype.scroll = function(deltaX, deltaY) {
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE:
    case Maze.TOPOLOGY_OUTDOOR:
      // not supported
      break;
    case Maze.TOPOLOGY_CYLINDER:
      this.tessellationOffsetX = util.euclideanMod(this.tessellationOffsetX + deltaX, this.sizeX * this.cellSize);
      break;
    case Maze.TOPOLOGY_TORUS:
      this.tessellationOffsetX = util.euclideanMod(this.tessellationOffsetX + deltaX, this.sizeX * this.cellSize);
      this.tessellationOffsetY = util.euclideanMod(this.tessellationOffsetY + deltaY, this.sizeY * this.cellSize);
      break;
    case Maze.TOPOLOGY_MOBIUS:
      this.tessellationOffsetX = util.euclideanMod(this.tessellationOffsetX + deltaX, this.sizeX * 2 * this.cellSize);
      break;
    default: throw Error();
  }
};

MazeRenderer.prototype.getRoomLocationFromPixelLocation = function(mouseX, mouseY) {
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE:
      var cellSizeHalf = this.cellSize / 2;
      var x = Math.floor((mouseX - cellSizeHalf) / this.cellSize);
      var y = Math.floor((mouseY - cellSizeHalf) / this.cellSize);
      // have to bounds check here, because getRoomFromLocation won't
      if (x < 0 || x >= this.sizeX) return null;
      if (y < 0 || y >= this.sizeY) return null;
      return {x:x, y:y};
    case Maze.TOPOLOGY_OUTDOOR:
      var cellSizeHalf = this.cellSize / 2;
      var x = Math.floor((mouseX - cellSizeHalf) / this.cellSize);
      var y = Math.floor((mouseY - cellSizeHalf) / this.cellSize);
      // don't bounds check here, because getRoomFromLocation will return the outdoor room.
      return {x:x, y:y};
    case Maze.TOPOLOGY_CYLINDER:
      var x = Math.floor(util.euclideanMod(mouseX - this.tessellationOffsetX, this.sizeX * this.cellSize) / this.cellSize);
      var y = Math.floor((mouseY - this.tessellationOffsetY) / this.cellSize);
      if (y < 0 || y >= this.sizeY) return null;
      return {x:x, y:y};
    case Maze.TOPOLOGY_TORUS:
      var x = Math.floor(util.euclideanMod(mouseX - this.tessellationOffsetX, this.sizeX * this.cellSize) / this.cellSize);
      var y = Math.floor(util.euclideanMod(mouseY - this.tessellationOffsetY, this.sizeY * this.cellSize) / this.cellSize);
      return {x:x, y:y};
    case Maze.TOPOLOGY_MOBIUS:
      var x = Math.floor(util.euclideanMod(mouseX - this.tessellationOffsetX, this.sizeX * 2 * this.cellSize) / this.cellSize);
      var y = Math.floor((mouseY - this.tessellationOffsetY) / this.cellSize);
      if (y < 0 || y >= this.sizeY) return null;
      if (x >= this.sizeX) {
        // invert
        x -= this.sizeX;
        y = this.sizeY - 1 - y;
      }
      return {x:x, y:y};
    default: throw Error();
  }
};

MazeRenderer.prototype.getTessellatedRoomLocation = function(x, y, tessellationIndexX, tessellationIndexY) {
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE:
    case Maze.TOPOLOGY_OUTDOOR:
    case Maze.TOPOLOGY_CYLINDER:
    case Maze.TOPOLOGY_TORUS:
      return {
        x: x + tessellationIndexX * this.sizeX,
        y: y + tessellationIndexY * this.sizeY,
      };
    case Maze.TOPOLOGY_MOBIUS:
      if (util.euclideanMod(tessellationIndexX, 2) === 1) {
        // invert
        y = this.sizeY - 1 - y;
      }
      return {
        x: x + tessellationIndexX * this.sizeX,
        y: y + tessellationIndexY * this.sizeY,
      };
    default: throw Error();
  }
};
MazeRenderer.prototype.getTessellatedEdgeLocation = function(x, y, orientation, tessellationIndexX, tessellationIndexY) {
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE:
    case Maze.TOPOLOGY_OUTDOOR:
    case Maze.TOPOLOGY_CYLINDER:
    case Maze.TOPOLOGY_TORUS:
      return {
        x: x + tessellationIndexX * this.sizeX,
        y: y + tessellationIndexY * this.sizeY,
      };
    case Maze.TOPOLOGY_MOBIUS:
      if (util.euclideanMod(tessellationIndexX, 2) === 1) {
        // invert
        if (orientation === Maze.HORIZONTAL) {
          y = (this.sizeY - 1) - 1 - y;
        } else {
          // vertical
          y = this.sizeY - 1 - y;
        }
      }
      return {
        x: x + tessellationIndexX * this.sizeX,
        y: y + tessellationIndexY * this.sizeY,
      };
    default: throw Error();
  }
};
MazeRenderer.prototype.getTessellatedVertexLocation = function(x, y, tessellationIndexX, tessellationIndexY) {
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE:
    case Maze.TOPOLOGY_OUTDOOR:
    case Maze.TOPOLOGY_CYLINDER:
    case Maze.TOPOLOGY_TORUS:
      return {
        x: x + tessellationIndexX * this.sizeX,
        y: y + tessellationIndexY * this.sizeY,
      };
    case Maze.TOPOLOGY_MOBIUS:
      if (util.euclideanMod(tessellationIndexX, 2) === 1) {
        // invert
        y = (this.sizeY - 1) - 1 - y;
      }
      return {
        x: x + tessellationIndexX * this.sizeX,
        y: y + tessellationIndexY * this.sizeY,
      };
    default: throw Error();
  }
};
