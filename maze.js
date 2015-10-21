Maze.FILLED = "#000000";
Maze.OPEN = "#ffffff";
Maze.VERTICAL = 0;
Maze.HORIZONTAL = 1;
Maze.TOPOLOGY_RECTANGLE = "rectangle";
Maze.TOPOLOGY_OUTDOOR   = "outdoor";
Maze.TOPOLOGY_CYLINDER  = "cylinder";
Maze.TOPOLOGY_TORUS     = "torus";
Maze.TOPOLOGY_MOBIUS    = "mobius";
function Maze(topology, sizeX, sizeY, options) {
  if (options == null) options = {};
  this.topology = topology;
  this.sizeX = sizeX;
  this.sizeY = sizeY;
  if (this.topology === Maze.TOPOLOGY_OUTDOOR) this.outdoorRoom = sizeX * sizeY;
  var initialEdgeColor = options.initialEdgeColor || Maze.OPEN;
  var initialRoomColor = options.initialRoomColor || Maze.OPEN;
  var initialVertexColor = options.initialVertexColor || Maze.OPEN;

  this.edgeColors = [];
  var edgeCount = this.getEdgeCount();
  for (var i = 0; i < edgeCount; i++) {
    this.edgeColors.push(initialEdgeColor);
  }

  this.roomColors = [];
  var roomCount = this.getRoomCount()
  for (var i = 0; i < roomCount; i++) {
    this.roomColors.push(initialRoomColor);
  }

  this.vertexColors = [];
  var vertexCount = this.getVertexCount();
  for (var i = 0; i < vertexCount; i++) {
    this.vertexColors.push(initialVertexColor);
  }
};

Maze.prototype.getEdgeCount = function() {
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE: return this.sizeX * (this.sizeY - 1) + (this.sizeX - 1) * this.sizeY;
    case Maze.TOPOLOGY_OUTDOOR:   return this.sizeX * (this.sizeY + 1) + (this.sizeX + 1) * this.sizeY;
    case Maze.TOPOLOGY_CYLINDER:  return this.sizeX * (this.sizeY - 1) +  this.sizeX      * this.sizeY;
    case Maze.TOPOLOGY_TORUS:     return this.sizeX *  this.sizeY      +  this.sizeX      * this.sizeY;
    case Maze.TOPOLOGY_MOBIUS:    return this.sizeX * (this.sizeY - 1) +  this.sizeX      * this.sizeY;
    default: throw Error();
  }
};
Maze.prototype.getEdgeFromLocation = function(orientation, x, y) {
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE:                                                                                 break;
    case Maze.TOPOLOGY_OUTDOOR:                                                                                   break;
    case Maze.TOPOLOGY_CYLINDER:  x = util.euclideanMod(x, this.sizeX);                                           break;
    case Maze.TOPOLOGY_TORUS:     x = util.euclideanMod(x, this.sizeX);     y = util.euclideanMod(y, this.sizeY); break;
    case Maze.TOPOLOGY_MOBIUS:    x = util.euclideanMod(x, this.sizeX * 2);                                       break;
    default: throw Error();
  }
  if (orientation === Maze.HORIZONTAL) {
    // horizontal
    switch (this.topology) {
      case Maze.TOPOLOGY_RECTANGLE: return x * (this.sizeY - 1) + y;
      case Maze.TOPOLOGY_OUTDOOR:   return x * (this.sizeY + 1) + y + 1;
      case Maze.TOPOLOGY_CYLINDER:  return x * (this.sizeY - 1) + y;
      case Maze.TOPOLOGY_TORUS:     return x * this.sizeY + y;
      case Maze.TOPOLOGY_MOBIUS:
        if (x >= this.sizeX) {
          // invert
          x -= this.sizeX;
          y = (this.sizeY - 1) - 1 - y;
        }
        return x * (this.sizeY - 1) + y;
      default: throw Error();
    }
  } else {
    // vertical
    switch (this.topology) {
      case Maze.TOPOLOGY_RECTANGLE:
        var horizontalEdgeCount = this.sizeX * (this.sizeY - 1);
        return horizontalEdgeCount + x * this.sizeY + y;
      case Maze.TOPOLOGY_OUTDOOR:
        var horizontalEdgeCount = this.sizeX * (this.sizeY + 1);
        return horizontalEdgeCount + (x + 1) * this.sizeY + y;
      case Maze.TOPOLOGY_CYLINDER:
        var horizontalEdgeCount = this.sizeX * (this.sizeY - 1);
        return horizontalEdgeCount + x * this.sizeY + y;
      case Maze.TOPOLOGY_TORUS:
        var horizontalEdgeCount = this.sizeX * this.sizeY;
        return horizontalEdgeCount + x * this.sizeY + y;
      case Maze.TOPOLOGY_MOBIUS:
        if (x >= this.sizeX) {
          // invert
          x -= this.sizeX;
          y = this.sizeY - 1 - y;
        }
        var horizontalEdgeCount = this.sizeX * (this.sizeY - 1);
        return horizontalEdgeCount + x * this.sizeY + y;
      default: throw Error();
    }
  }
};
Maze.prototype.getEdgeLocation = function(edge) {
  var orientation;
  var x;
  var y;
  var horizontalEdgeCount;
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE: horizontalEdgeCount = this.sizeX * (this.sizeY - 1); break;
    case Maze.TOPOLOGY_OUTDOOR:   horizontalEdgeCount = this.sizeX * (this.sizeY + 1); break;
    case Maze.TOPOLOGY_CYLINDER:  horizontalEdgeCount = this.sizeX * (this.sizeY - 1); break;
    case Maze.TOPOLOGY_TORUS:     horizontalEdgeCount = this.sizeX * (this.sizeY    ); break;
    case Maze.TOPOLOGY_MOBIUS:    horizontalEdgeCount = this.sizeX * (this.sizeY - 1); break;
    default: throw Error();
  }
  if (edge < horizontalEdgeCount) {
    orientation = Maze.HORIZONTAL;
    switch (this.topology) {
      case Maze.TOPOLOGY_RECTANGLE: x = Math.floor(edge / (this.sizeY - 1)); y = edge % (this.sizeY - 1);     break;
      case Maze.TOPOLOGY_OUTDOOR:   x = Math.floor(edge / (this.sizeY + 1)); y = edge % (this.sizeY + 1) - 1; break;
      case Maze.TOPOLOGY_CYLINDER:  x = Math.floor(edge / (this.sizeY - 1)); y = edge % (this.sizeY - 1);     break;
      case Maze.TOPOLOGY_TORUS:     x = Math.floor(edge / (this.sizeY    )); y = edge % (this.sizeY    );     break;
      case Maze.TOPOLOGY_MOBIUS:    x = Math.floor(edge / (this.sizeY - 1)); y = edge % (this.sizeY - 1);     break;
      default: throw Error();
    }
  } else {
    edge -= horizontalEdgeCount;
    orientation = Maze.VERTICAL;
    switch (this.topology) {
      case Maze.TOPOLOGY_RECTANGLE: x = Math.floor(edge / this.sizeY);     y = edge % this.sizeY; break;
      case Maze.TOPOLOGY_OUTDOOR:   x = Math.floor(edge / this.sizeY) - 1; y = edge % this.sizeY; break;
      case Maze.TOPOLOGY_CYLINDER:  x = Math.floor(edge / this.sizeY);     y = edge % this.sizeY; break;
      case Maze.TOPOLOGY_TORUS:     x = Math.floor(edge / this.sizeY);     y = edge % this.sizeY; break;
      case Maze.TOPOLOGY_MOBIUS:    x = Math.floor(edge / this.sizeY);     y = edge % this.sizeY; break;
      default: throw Error();
    }
  }
  return {orientation:orientation, x:x, y:y};
};

Maze.prototype.getRoomCount = function() {
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE: return this.sizeX * this.sizeY;
    case Maze.TOPOLOGY_OUTDOOR:   return this.sizeX * this.sizeY + 1;
    case Maze.TOPOLOGY_CYLINDER:  return this.sizeX * this.sizeY;
    case Maze.TOPOLOGY_TORUS:     return this.sizeX * this.sizeY;
    case Maze.TOPOLOGY_MOBIUS:    return this.sizeX * this.sizeY;
    default: throw Error();
  }
};
Maze.prototype.getRoomFromLocation = function(x, y) {
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE: break;
    case Maze.TOPOLOGY_OUTDOOR:
      // out of bounds is outdoors
      if (x < 0 || x >= this.sizeX ||
          y < 0 || y >= this.sizeY) {
        return this.outdoorRoom;
      }
      break;
    case Maze.TOPOLOGY_CYLINDER:  x = util.euclideanMod(x, this.sizeX);                                       break;
    case Maze.TOPOLOGY_TORUS:     x = util.euclideanMod(x, this.sizeX); y = util.euclideanMod(y, this.sizeY); break;
    case Maze.TOPOLOGY_MOBIUS:
      x = util.euclideanMod(x, this.sizeX * 2);
      if (x >= this.sizeX) {
        // invert
        x -= this.sizeX;
        y = this.sizeY - 1 - y;
      }
      break;
    default: throw Error();
  }
  return this.sizeY * x + y;
};
Maze.prototype.getRoomLocation = function(room) {
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE: break;
    case Maze.TOPOLOGY_OUTDOOR:
      // the official "location" of the outdoors room is where you'd expect it's upper-left corner.
      if (room === this.outdoorRoom) return {x:-1, y:-1};
      break;
    case Maze.TOPOLOGY_CYLINDER:  break;
    case Maze.TOPOLOGY_TORUS:     break;
    case Maze.TOPOLOGY_MOBIUS:    break;
    default: throw Error();
  }
  var x = Math.floor(room / this.sizeY);
  var y = room % this.sizeY;
  return {x:x, y:y};
};

Maze.prototype.roomToVectors = function(room) {
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE: break;
    case Maze.TOPOLOGY_OUTDOOR:
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
            edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x, this.sizeY - 1),
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
            edge:this.getEdgeFromLocation(Maze.VERTICAL, this.sizeX - 1, y),
            room:this.getRoomFromLocation(this.sizeX - 1, y),
          });
        }
        return result;
      }
      break;
    case Maze.TOPOLOGY_CYLINDER:  break;
    case Maze.TOPOLOGY_TORUS:     break;
    case Maze.TOPOLOGY_MOBIUS:    break;
    default: throw Error();
  }
  var roomLocation = this.getRoomLocation(room);
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE:
      var vectors = [];
      var edges = [
        this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x + 0, roomLocation.y    ),
        this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x - 1, roomLocation.y    ),
        this.getEdgeFromLocation(Maze.HORIZONTAL, roomLocation.x    , roomLocation.y + 0),
        this.getEdgeFromLocation(Maze.HORIZONTAL, roomLocation.x    , roomLocation.y - 1),
      ];
      var neighborLocations = [
        {x:roomLocation.x + 1, y:roomLocation.y    },
        {x:roomLocation.x - 1, y:roomLocation.y    },
        {x:roomLocation.x    , y:roomLocation.y + 1},
        {x:roomLocation.x    , y:roomLocation.y - 1},
      ];
      for (var i = 0; i < neighborLocations.length; i++) {
        var neighborLocation = neighborLocations[i];
        // bounds check
        if (neighborLocation.x < 0 || neighborLocation.x >= this.sizeX) continue;
        if (neighborLocation.y < 0 || neighborLocation.y >= this.sizeY) continue;
        var neighbor = this.getRoomFromLocation(neighborLocation.x, neighborLocation.y);
        vectors.push({edge:edges[i], room:neighbor});
      }
      return vectors;
    case Maze.TOPOLOGY_OUTDOOR:
    case Maze.TOPOLOGY_TORUS:
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
    case Maze.TOPOLOGY_CYLINDER:
    case Maze.TOPOLOGY_MOBIUS:
      var vectors = [
        { edge:this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x + 0, roomLocation.y),
          room:this.getRoomFromLocation(                 roomLocation.x + 1, roomLocation.y) },
        { edge:this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x - 1, roomLocation.y),
          room:this.getRoomFromLocation(                 roomLocation.x - 1, roomLocation.y) },
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
    default: throw Error();
  }
};

Maze.prototype.edgeToRoomPair = function(edge) {
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

Maze.prototype.getVertexCount = function() {
  return (this.sizeX - 1) * (this.sizeY - 1);
};
Maze.prototype.getVertexLocation = function(vertex) {
  var x = Math.floor(vertex / (this.sizeY - 1));
  var y = vertex % (this.sizeY - 1);
  return {x:x, y:y};
};
Maze.prototype.getVertexFromLocation = function(x, y) {
  return (this.sizeY - 1) * x + y;
};
Maze.prototype.vertexToEdges = function(vertex) {
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
Maze.prototype.vertexToBranches = function(vertex) {
  var vertexLocation = this.getVertexLocation(vertex);
  var x = vertexLocation.x;
  var y = vertexLocation.y;
  var branches = [];
  if (x < this.sizeX - 2) {
    branches.push({
      vertex:this.getVertexFromLocation(x + 1, y),
      edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x + 1, y),
    });
  }
  if (x > 0) {
    branches.push({
      vertex:this.getVertexFromLocation(x - 1, y),
      edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x, y),
    });
  }
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
Maze.prototype.getBorderBranches = function() {
  var branches = [];
  if (this.sizeY > 1) {
    for (var x = 0; x < this.sizeX - 1; x++) {
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
  if (this.sizeX > 1) {
    for (var y = 0; y < this.sizeY - 1; y++) {
      branches.push({
        vertex:this.getVertexFromLocation(0, y),
        edge:this.getEdgeFromLocation(Maze.HORIZONTAL, 0, y),
      });
      branches.push({
        vertex:this.getVertexFromLocation(this.sizeX - 2, y),
        edge:this.getEdgeFromLocation(Maze.HORIZONTAL, this.sizeX - 1, y),
      });
    }
  }
  return branches;
};

Maze.prototype.shave = function() {
  var self = this;
  var edgesToOpen = [];
  var vertexCount = this.getVertexCount();
  for (var i = 0; i < vertexCount; i++) {
    var edges = self.vertexToEdges(i).filter(function(edge) {
      return self.edgeColors[edge] === Maze.FILLED;
    });
    if (edges.length === 1) {
      // this is a hair
      this.vertexColors[i] = Maze.OPEN;
      // don't cut it off yet, because we're still measuring where the hairs are.
      edgesToOpen.push(edges[0]);
    }
  }
  for (var i = 0; i < edgesToOpen.length; i++) {
    self.edgeColors[edgesToOpen[i]] = Maze.OPEN;
  }
};
Maze.prototype.caveIn = function() {
  var self = this;
  var roomsToFill = [];
  var edgesToFill = [];
  var roomCount = this.getRoomCount();
  for (var i = 0; i < roomCount; i++) {
    var openVectors = self.roomToVectors(i).filter(function(vector) {
      return self.edgeColors[vector.edge] === Maze.OPEN;
    });
    if (openVectors.length === 1) {
      // this is a dead end
      roomsToFill.push(i);
      edgesToFill.push(openVectors[0].edge);
    } else if (openVectors.length === 0 && self.roomColors[i] === Maze.OPEN) {
      // isolated room.
      // this can happen if 3 rooms were the last 3 rooms for the previous caveIn.
      // then 1 room is left alone with no doors.
      roomsToFill.push(i);
    }
  }
  for (var i = 0; i < roomsToFill.length; i++) {
    self.roomColors[roomsToFill[i]] = Maze.FILLED;
  }
  for (var i = 0; i < edgesToFill.length; i++) {
    self.edgeColors[edgesToFill[i]] = Maze.FILLED;
  }
};

Maze.hexEncoding = "abcdefghijklmnop";
Maze.prototype.getSerialization = function() {
  var self = this;
  var bitArray = self.edgeColors.map(function(edge) { return edge === Maze.FILLED ? 1 : 0; });
  var nibbleAlignment = (bitArray.length + 3) & ~3;
  // pad
  for (var i = bitArray.length; i < nibbleAlignment; i++) {
    bitArray.push(0);
  }
  var topologySerialization = (function() {
    switch (self.constructor) {
      case Maze: return "rectangle";
      case OutdoorMaze: return "outdoor";
      case CylinderMaze: return "cylinder";
      case TorusMaze: return "torus";
      case MobiusMaze: return "mobius";
    }
    throw new Error();
  })();
  var serialization = topologySerialization + "," + self.sizeX + "," + self.sizeY + ",";
  for (var i = 0; i < bitArray.length; i += 4) {
    var nibble = (bitArray[i+0] << 3) |
                 (bitArray[i+1] << 2) |
                 (bitArray[i+2] << 1) |
                 (bitArray[i+3] << 0) ;
    serialization += Maze.hexEncoding[nibble];
  }
  return serialization;
};
Maze.decodeRegex = new RegExp("^(rectangle|outdoor|cylinder|torus|mobius),(\\d+),(\\d+),([" + Maze.hexEncoding + "]*)$");
Maze.fromSerialization = function(string) {
  var match = Maze.decodeRegex.exec(string);
  if (match == null) return null;
  var topology = match[1];
  var sizeX = parseInt(match[2]);
  var sizeY = parseInt(match[3]);
  var edgeData = match[4];
  var maze = new Maze(topology, sizeX, sizeY, {initialVertexColor: Maze.FILLED});

  var zero = Maze.hexEncoding.charCodeAt(0);
  var bitArray = [];
  for (var i = 0; i < edgeData.length; i++) {
    var nibble = edgeData.charCodeAt(i) - zero;
    bitArray.push((nibble & 0x8) >> 3);
    bitArray.push((nibble & 0x4) >> 2);
    bitArray.push((nibble & 0x2) >> 1);
    bitArray.push((nibble & 0x1) >> 0);
  }

  var edgeCount = maze.getEdgeCount();
  var extraBitCount = bitArray.length - edgeCount;
  if (!(0 <= extraBitCount && extraBitCount < 4)) return null;
  for (var i = 0; i < extraBitCount; i++) {
    bitArray.pop();
  }

  for (var i = 0; i < edgeCount; i++) {
    if (bitArray[i] !== 0) maze.edgeColors[i] = Maze.FILLED;
  }
  return maze;
};

Maze.prototype.makeRenderer = function(canvas) {
  return new MazeRenderer(canvas, this.sizeX, this.sizeY);
};


function MazeRenderer(canvas, sizeX, sizeY) {
  this.canvas = canvas;
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
};

MazeRenderer.prototype.scroll = function(deltaX, deltaY) {
  // not supported
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

MazeRenderer.prototype.getTessellatedRoomLocation = function(x, y, tessellationIndexX, tessellationIndexY) {
  return {
    x: x + tessellationIndexX * this.sizeX,
    y: y + tessellationIndexY * this.sizeY,
  };
};
MazeRenderer.prototype.getTessellatedEdgeLocation = function(x, y, orientation, tessellationIndexX, tessellationIndexY) {
  return {
    x: x + tessellationIndexX * this.sizeX,
    y: y + tessellationIndexY * this.sizeY,
  };
};
MazeRenderer.prototype.getTessellatedVertexLocation = function(x, y, tessellationIndexX, tessellationIndexY) {
  return {
    x: x + tessellationIndexX * this.sizeX,
    y: y + tessellationIndexY * this.sizeY,
  };
};
