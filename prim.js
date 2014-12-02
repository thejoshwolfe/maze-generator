function PrimGenerator(x, y) {
  this.maze = new Maze(x, y, Maze.FILLED, Maze.FILLED);
  this.isDone = false;

  this.includedRooms = [];
  var roomCount = this.maze.getRoomCount();
  for (var i = 0; i < roomCount; i++) {
    this.includedRooms[i] = false;
  }

  this.wallsConsidered = [];
  var wallCount = this.maze.getWallCount();
  for (var i = 0; i < wallCount; i++) {
    this.wallsConsidered[i] = false;
  }

  this.transitionVectors = [];

  // pick a starting room
  var startingRoom = Math.floor(Math.random() * this.maze.getRoomCount());
  this.addRoomToMaze(startingRoom);
}

PrimGenerator.prototype.addRoomToMaze = function(roomScalar) {
  this.includedRooms[roomScalar] = true;
  var room = this.maze.scalarToRoom(roomScalar);
  this.maze.roomColors[room.x][room.y] = Maze.OPEN;
  var rooms = [
    {x:room.x + 1, y:room.y - 0},
    {x:room.x + 0, y:room.y + 1},
    {x:room.x - 1, y:room.y + 0},
    {x:room.x - 0, y:room.y - 1},
  ];
  var walls = [
    {wallsArray:this.maze.verticalWallColors,   i:room.x + 0, j:room.y + 0},
    {wallsArray:this.maze.horizontalWallColors, i:room.x + 0, j:room.y + 0},
    {wallsArray:this.maze.verticalWallColors,   i:room.x - 1, j:room.y + 0},
    {wallsArray:this.maze.horizontalWallColors, i:room.x + 0, j:room.y - 1},
  ];
  for (var i = 0; i < 4; i++) {
    var toRoom = rooms[i];
    // bounds check
    if (toRoom.x < 0 || toRoom.x >= this.maze.sizeX) continue;
    if (toRoom.y < 0 || toRoom.y >= this.maze.sizeY) continue;
    // make sure we're not ceating a loop
    var toRoomScalar = this.maze.roomToScalar(toRoom.x, toRoom.y);
    if (this.includedRooms[toRoomScalar]) continue;
    this.transitionVectors.push({wall:walls[i], toRoomScalar:toRoomScalar});
  }
};

PrimGenerator.prototype.step = function() {
  while (this.transitionVectors.length > 0) {
    var vector = util.popRandom(this.transitionVectors);
    if (this.includedRooms[vector.toRoomScalar]) continue;
    // open the door
    this.maze.setWallColor(vector.wall, Maze.OPEN);
    this.addRoomToMaze(vector.toRoomScalar);
    return;
  }
  this.isDone = true;
};
