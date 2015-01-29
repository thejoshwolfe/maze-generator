function DepthFirstSearchGenerator(topology, sizeX, sizeY) {
  this.maze = new topology(sizeX, sizeY, {
    initialRoomColor: Maze.FILLED,
    initialEdgeColor: Maze.FILLED,
    initialVertexColor: Maze.FILLED,
  });

  // room,edge,room,edge, ..., room
  this.stack = [];
  this.doneRooms = [];
  this.startedYet = false;
}

DepthFirstSearchGenerator.CONSIDERING = "#8888ff";

DepthFirstSearchGenerator.prototype.isDone = function() {
  return this.startedYet && this.stack.length === 0;
};

DepthFirstSearchGenerator.prototype.step = function() {
  var self = this;

  if (!self.startedYet) {
    // pick a starting room
    var startingRoom = util.randomInt(this.maze.getRoomCount());
    self.stack.push(startingRoom);
    self.maze.roomColors[startingRoom] = DepthFirstSearchGenerator.CONSIDERING;
    self.startedYet = true;
    return;
  }
  while (self.stack.length > 0) {
    var room = self.stack[self.stack.length - 1];
    var vectors = self.maze.roomToVectors(room).filter(function(vector) {
      // make sure we're not creating a loop
      if (self.maze.roomColors[vector.room] !== Maze.FILLED) return false;
      return true;
    });
    if (vectors.length === 0) {
      // back out
      self.maze.roomColors[room] = Maze.OPEN;
      self.stack.pop();
      // clean up edge color
      if (self.stack.length > 0) {
        var edge = self.stack.pop();
        self.maze.edgeColors[edge] = Maze.OPEN;
      }
      return;
    }
    // go in a random direction
    var vector = vectors[util.randomInt(vectors.length)];
    self.maze.edgeColors[vector.edge] = DepthFirstSearchGenerator.CONSIDERING;
    self.maze.roomColors[vector.room] = DepthFirstSearchGenerator.CONSIDERING;
    self.stack.push(vector.edge);
    self.stack.push(vector.room);
    return;
  }
};
