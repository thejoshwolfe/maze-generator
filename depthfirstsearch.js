util.inherits(DepthFirstSearchGenerator, MazeGenerator);
function DepthFirstSearchGenerator(x, y) {
  MazeGenerator.call(this, x, y, MazeGenerator.FILLED, MazeGenerator.FILLED);

  this.stack = [];
  this.doneRooms = [];

  // pick a starting room
  var startingRoom = Math.floor(Math.random() * this.getRoomCount());
  this.addRoomToMaze(startingRoom);
}

DepthFirstSearchGenerator.CONSIDERING = "#8888ff";

DepthFirstSearchGenerator.prototype.addRoomToMaze = function(roomScalar) {
  this.stack.push(roomScalar);
  var room = this.scalarToRoom(roomScalar);
  this.roomColors[room.x][room.y] = MazeGenerator.OPEN;
};

DepthFirstSearchGenerator.prototype.step = function() {
  var self = this;
  while (true) {
    if (self.stack.length === 0) return false;
    var roomScalar = self.stack[self.stack.length - 1];
    var room = self.scalarToRoom(roomScalar);
    var neighbors = [
      {x:room.x + 1, y:room.y - 0},
      {x:room.x + 0, y:room.y + 1},
      {x:room.x - 1, y:room.y + 0},
      {x:room.x - 0, y:room.y - 1},
    ];
    var walls = [
      {wallsArray:self.verticalWallColors,   i:room.x + 0, j:room.y + 0},
      {wallsArray:self.horizontalWallColors, i:room.x + 0, j:room.y + 0},
      {wallsArray:self.verticalWallColors,   i:room.x - 1, j:room.y + 0},
      {wallsArray:self.horizontalWallColors, i:room.x + 0, j:room.y - 1},
    ];
    var vectors = [];
    for (var i = 0; i < 4; i++) {
      var neighbor = neighbors[i];
      // bounds check
      if (neighbor.x < 0 || neighbor.x >= self.sizeX) continue;
      if (neighbor.y < 0 || neighbor.y >= self.sizeY) continue;
      // make sure we're not ceating a loop
      if (self.roomColors[neighbor.x][neighbor.y] !== MazeGenerator.FILLED) continue;
      vectors.push({wall:walls[i], neighbor:neighbor});
    }
    if (vectors.length === 0) {
      // back out
      self.roomColors[room.x][room.y] = MazeGenerator.OPEN;
      self.stack.pop();
      break;
    }
    // go in a random direction
    var vector = vectors[Math.floor(Math.random() * vectors.length)];
    var wall = vector.wall;
    wall.wallsArray[wall.i][wall.j] = MazeGenerator.OPEN;
    self.roomColors[vector.neighbor.x][vector.neighbor.y] = DepthFirstSearchGenerator.CONSIDERING;
    var neighborScalar = self.roomToScalar(vector.neighbor.x, vector.neighbor.y);
    self.stack.push(neighborScalar);
    break;
  }
  return true;
};
