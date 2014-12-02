function DepthFirstSearchGenerator(x, y) {
  this.maze = new Maze(x, y, Maze.FILLED, Maze.FILLED);
  this.isDone = false;

  this.stack = [];
  this.doneRooms = [];

  // pick a starting room
  var startingRoom = Math.floor(Math.random() * this.maze.getRoomCount());
  this.addRoomToMaze(startingRoom);
}

DepthFirstSearchGenerator.CONSIDERING = "#8888ff";

DepthFirstSearchGenerator.prototype.addRoomToMaze = function(roomScalar) {
  this.stack.push(roomScalar);
  var room = this.maze.scalarToRoom(roomScalar);
  this.maze.roomColors[room.x][room.y] = DepthFirstSearchGenerator.CONSIDERING;
};

DepthFirstSearchGenerator.prototype.step = function() {
  var self = this;
  while (self.stack.length > 0) {
    var roomScalar = self.stack[self.stack.length - 1];
    var room = self.maze.scalarToRoom(roomScalar);
    var vectors = self.maze.roomToVectors(room.x, room.y).filter(function(vector) {
      // make sure we're not creating a loop
      if (self.maze.roomColors[vector.room.x][vector.room.y] !== Maze.FILLED) return false;
      return true;
    });
    if (vectors.length === 0) {
      // back out
      self.maze.roomColors[room.x][room.y] = Maze.OPEN;
      self.stack.pop();
      return;
    }
    // go in a random direction
    var vector = vectors[Math.floor(Math.random() * vectors.length)];
    self.maze.setWallColor(vector.wall, Maze.OPEN);
    self.maze.roomColors[vector.room.x][vector.room.y] = DepthFirstSearchGenerator.CONSIDERING;
    var neighborScalar = self.maze.roomToScalar(vector.room.x, vector.room.y);
    self.stack.push(neighborScalar);
    return;
  }
  self.isDone = true;
};
