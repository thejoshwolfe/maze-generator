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
  this.vectors = null;
}

DepthFirstSearchGenerator.CONSIDERING = "#8888ff";

DepthFirstSearchGenerator.prototype.getOptions = function() {
  var self = this;
  if (!self.startedYet) {
    // pick a starting room
    return {
      type: "room",
      values: util.range(self.maze.getRoomCount()),
    };
  }

  if (self.stack.length === 0) return null;

  // offer a selection of directions to travel from here.
  var room = self.stack[self.stack.length - 1];
  self.vectors = self.maze.roomToVectors(room).filter(function(vector) {
    // make sure we're not creating a loop
    if (self.maze.roomColors[vector.room] !== Maze.FILLED) return false;
    return true;
  });
  return {
    type: "vector",
    values: self.vectors,
  };
};
DepthFirstSearchGenerator.prototype.doOption = function(index) {
  if (!this.startedYet) {
    // the starting room
    var startingRoom = index;
    this.stack.push(startingRoom);
    this.maze.roomColors[startingRoom] = DepthFirstSearchGenerator.CONSIDERING;
    this.startedYet = true;
    return;
  }
  if (this.vectors.length !== 0) {
    // go in the specified direction
    var vector = this.vectors[index];
    this.maze.edgeColors[vector.edge] = DepthFirstSearchGenerator.CONSIDERING;
    this.maze.roomColors[vector.room] = DepthFirstSearchGenerator.CONSIDERING;
    this.stack.push(vector.edge);
    this.stack.push(vector.room);
  } else {
    // back out
    var room = this.stack[this.stack.length - 1];
    this.maze.roomColors[room] = Maze.OPEN;
    this.stack.pop();
    // clean up edge color
    if (this.stack.length > 0) {
      var edge = this.stack.pop();
      this.maze.edgeColors[edge] = Maze.OPEN;
    }
  }
};
