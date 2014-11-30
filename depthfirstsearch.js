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
  var self = this;
  while (self.stack.length > 0) {
    var roomScalar = self.stack[self.stack.length - 1];
    var room = self.scalarToRoom(roomScalar);
    var vectors = self.roomToVectors(room.x, room.y).filter(function(vector) {
      // make sure we're not creating a loop
      if (self.roomColors[vector.room.x][vector.room.y] !== MazeGenerator.FILLED) return false;
      return true;
    });
    if (vectors.length === 0) {
      // back out
      self.roomColors[room.x][room.y] = MazeGenerator.OPEN;
      self.stack.pop();
      return;
    }
    // go in a random direction
    var vector = vectors[Math.floor(Math.random() * vectors.length)];
    self.setWallColor(vector.wall, MazeGenerator.OPEN);
    self.roomColors[vector.room.x][vector.room.y] = DepthFirstSearchGenerator.CONSIDERING;
    var neighborScalar = self.roomToScalar(vector.room.x, vector.room.y);
    self.stack.push(neighborScalar);
    return;
  }
  self.isDone = true;
};
