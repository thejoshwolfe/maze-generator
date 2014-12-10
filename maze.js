
Maze.FILLED = "#000000";
Maze.OPEN = "#ffffff";
Maze.VERTICAL = 0;
Maze.HORIZONTAL = 1;
function Maze(sizeX, sizeY, initialEdgeColor, initialRoomColor) {
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
};

Maze.prototype.getEdgeCount = function() {
  return this.sizeX * (this.sizeY - 1) + (this.sizeX - 1) * this.sizeY;
};
Maze.prototype.getEdgeFromLocation = function(orientation, i, j) {
  if (orientation === Maze.HORIZONTAL) {
    // horizontal
    return i * (this.sizeY - 1) + j;
  } else {
    // vertical
    var horizontalEdgeCount = this.sizeX * (this.sizeY - 1);
    return horizontalEdgeCount + i * this.sizeY + j;
  }
};
Maze.prototype.getEdgeLocation = function(edge) {
  var orientation;
  var i;
  var j;
  var horizontalEdgeCount = this.sizeX * (this.sizeY - 1);
  if (edge < horizontalEdgeCount) {
    orientation = Maze.HORIZONTAL;
    i = Math.floor(edge / (this.sizeY - 1));
    j = edge % (this.sizeY - 1);
  } else {
    edge -= horizontalEdgeCount;
    orientation = Maze.VERTICAL;
    i = Math.floor(edge / this.sizeY);
    j = edge % this.sizeY;
  }
  return {orientation:orientation, i:i, j:j};
};

Maze.prototype.getRoomCount = function() {
  return this.sizeX * this.sizeY;
};
Maze.prototype.getRoomFromLocation = function(x, y) {
  return this.sizeY * x + y;
};
Maze.prototype.getRoomLocation = function(room) {
  var x = Math.floor(room / this.sizeY);
  var y = room % this.sizeY;
  return {x:x, y:y};
};

Maze.prototype.roomToVectors = function(room) {
  var roomLocation = this.getRoomLocation(room);
  var neighborLocations = [
    {x:roomLocation.x + 1, y:roomLocation.y - 0},
    {x:roomLocation.x + 0, y:roomLocation.y + 1},
    {x:roomLocation.x - 1, y:roomLocation.y + 0},
    {x:roomLocation.x - 0, y:roomLocation.y - 1},
  ];
  var edges = [
    this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x + 0, roomLocation.y + 0),
    this.getEdgeFromLocation(Maze.HORIZONTAL, roomLocation.x + 0, roomLocation.y + 0),
    this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x - 1, roomLocation.y + 0),
    this.getEdgeFromLocation(Maze.HORIZONTAL, roomLocation.x + 0, roomLocation.y - 1),
  ];
  var vectors = [];
  for (var i = 0; i < 4; i++) {
    var neighborLocation = neighborLocations[i];
    // bounds check
    if (neighborLocation.x < 0 || neighborLocation.x >= this.sizeX) continue;
    if (neighborLocation.y < 0 || neighborLocation.y >= this.sizeY) continue;
    var neighbor = this.getRoomFromLocation(neighborLocation.x, neighborLocation.y);
    vectors.push({edge:edges[i], room:neighbor});
  }
  return vectors;
};
Maze.prototype.edgeToRoomPair = function(edge) {
  var edgeLocation = this.getEdgeLocation(edge);
  var result = [];
  var x = edgeLocation.i;
  var y = edgeLocation.j;
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
  if (y > 0) {
    branches.push({
      vertex:this.getVertexFromLocation(x, y - 1),
      edge:this.getEdgeFromLocation(Maze.VERTICAL, x, y),
    });
  }
  if (y < this.sizeY - 2) {
    branches.push({
      vertex:this.getVertexFromLocation(x, y + 1),
      edge:this.getEdgeFromLocation(Maze.VERTICAL, x, y + 1),
    });
  }
  if (x > 0) {
    branches.push({
      vertex:this.getVertexFromLocation(x - 1, y),
      edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x, y),
    });
  }
  if (x < this.sizeX - 2) {
    branches.push({
      vertex:this.getVertexFromLocation(x + 1, y),
      edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x + 1, y),
    });
  }
  return branches;
};
Maze.prototype.getBorderBranches = function() {
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
  if (this.sizeX > 1) {
    for (var y = 0; y < this.sizeY - 2; y++) {
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
  var bitArray = this.edgeColors.map(function(edge) { return edge === Maze.FILLED ? 1 : 0; });
  var nibbleAlignment = (bitArray.length + 3) & ~3;
  // pad
  for (var i = bitArray.length; i < nibbleAlignment; i++) {
    bitArray.push(0);
  }
  var serialization = this.sizeX + "," + this.sizeY + ",";
  for (var i = 0; i < bitArray.length; i += 4) {
    var nibble = (bitArray[i+0] << 3) |
                 (bitArray[i+1] << 2) |
                 (bitArray[i+2] << 1) |
                 (bitArray[i+3] << 0) ;
    serialization += Maze.hexEncoding[nibble];
  }
  return serialization;
};
Maze.decodeRegex = new RegExp("^(\\d+),(\\d+),([" + Maze.hexEncoding + "]*)$");
Maze.fromSerialization = function(string) {
  var match = Maze.decodeRegex.exec(string);
  if (match == null) return null;
  var maze = new Maze(parseInt(match[1]), parseInt(match[2]), Maze.OPEN, Maze.OPEN);

  var zero = Maze.hexEncoding.charCodeAt(0);
  var bitArray = [];
  var edgeData = match[3];
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
  this.cellSize = 10;
  canvas.width = (sizeX + 1) * this.cellSize;
  canvas.height = (sizeY + 1) * this.cellSize;
}

MazeRenderer.prototype.render = function(maze) {
  var context = this.canvas.getContext("2d");
  var cellSize = this.cellSize;
  var cellSizeHalf = cellSize / 2;

  // roomColors
  var roomCount = maze.getRoomCount();
  for (var i = 0; i < roomCount; i++) {
    var color = maze.roomColors[i];
    if (color === Maze.OPEN) continue;
    var roomLocation = maze.getRoomLocation(i);
    var x = roomLocation.x;
    var y = roomLocation.y;
    context.fillStyle = color;
    context.fillRect(x * cellSize + cellSize - cellSizeHalf, y * cellSize + cellSize - cellSizeHalf, cellSize, cellSize);
  }

  // edges
  var edgeCount = maze.getEdgeCount();
  for (var i = 0; i < edgeCount; i++) {
    var color = maze.edgeColors[i];
    if (color === Maze.OPEN) continue;
    var edgeLocation = maze.getEdgeLocation(i);
    var x = edgeLocation.i;
    var y = edgeLocation.j;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(x * cellSize + cellSize + cellSizeHalf, y * cellSize + cellSize + cellSizeHalf);
    if (edgeLocation.orientation === Maze.HORIZONTAL) {
      context.lineTo(x * cellSize + cellSize - cellSizeHalf, y * cellSize + cellSize + cellSizeHalf);
    } else {
      context.lineTo(x * cellSize + cellSize + cellSizeHalf, y * cellSize + cellSize - cellSizeHalf);
    }
    context.stroke();
  }

  // borders
  context.strokeStyle = Maze.FILLED;
  context.beginPath();
  context.moveTo(cellSizeHalf, cellSizeHalf);
  context.lineTo(cellSizeHalf + this.sizeX * cellSize, cellSizeHalf);
  context.lineTo(cellSizeHalf + this.sizeX * cellSize, cellSizeHalf + this.sizeY * cellSize);
  context.lineTo(cellSizeHalf, cellSizeHalf + this.sizeY * cellSize);
  context.lineTo(cellSizeHalf, cellSizeHalf);
  context.stroke();
};

MazeRenderer.prototype.zoom = function(delta, anchorX, anchorY) {
  // not supported
  return;
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
