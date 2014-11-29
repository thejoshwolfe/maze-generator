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
  this.roomColors[room.x][room.y] = DepthFirstSearchGenerator.CONSIDERING;
};

DepthFirstSearchGenerator.prototype.step = function() {
  while (this.stack.length > 0) {
    var roomScalar = this.stack[this.stack.length - 1];
    var room = this.scalarToRoom(roomScalar);
    var neighbors = [
      {x:room.x + 1, y:room.y - 0},
      {x:room.x + 0, y:room.y + 1},
      {x:room.x - 1, y:room.y + 0},
      {x:room.x - 0, y:room.y - 1},
    ];
    var walls = [
      {wallsArray:this.verticalWallColors,   i:room.x + 0, j:room.y + 0},
      {wallsArray:this.horizontalWallColors, i:room.x + 0, j:room.y + 0},
      {wallsArray:this.verticalWallColors,   i:room.x - 1, j:room.y + 0},
      {wallsArray:this.horizontalWallColors, i:room.x + 0, j:room.y - 1},
    ];
    var vectors = [];
    for (var i = 0; i < 4; i++) {
      var neighbor = neighbors[i];
      // bounds check
      if (neighbor.x < 0 || neighbor.x >= this.sizeX) continue;
      if (neighbor.y < 0 || neighbor.y >= this.sizeY) continue;
      // make sure we're not creating a loop
      if (this.roomColors[neighbor.x][neighbor.y] !== MazeGenerator.FILLED) continue;
      vectors.push({wall:walls[i], neighbor:neighbor});
    }
    if (vectors.length === 0) {
      // back out
      this.roomColors[room.x][room.y] = MazeGenerator.OPEN;
      this.stack.pop();
      return;
    }
    // go in a random direction
    var vector = vectors[Math.floor(Math.random() * vectors.length)];
    var wall = vector.wall;
    wall.wallsArray[wall.i][wall.j] = MazeGenerator.OPEN;
    this.roomColors[vector.neighbor.x][vector.neighbor.y] = DepthFirstSearchGenerator.CONSIDERING;
    var neighborScalar = this.roomToScalar(vector.neighbor.x, vector.neighbor.y);
    this.stack.push(neighborScalar);
    return;
  }
  this.isDone = true;
};
