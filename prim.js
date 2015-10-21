function PrimGenerator(topology, sizeX, sizeY) {
  this.maze = new Maze(topology, sizeX, sizeY, {
    initialRoomColor: Maze.FILLED,
    initialEdgeColor: Maze.FILLED,
    initialVertexColor: Maze.FILLED,
  });

  this.includedRooms = [];
  var roomCount = this.maze.getRoomCount();
  for (var i = 0; i < roomCount; i++) {
    this.includedRooms[i] = false;
  }

  this.transitionVectors = [];

  this.startedYet = false;
}

PrimGenerator.prototype.addRoomToMaze = function(room) {
  this.includedRooms[room] = true;
  this.maze.roomColors[room] = Maze.OPEN;

  // look around
  var vectors = this.maze.roomToVectors(room);
  for (var i = 0; i < vectors.length; i++) {
    // make sure we're not ceating a loop
    if (this.includedRooms[vectors[i].room]) continue;
    this.transitionVectors.push(vectors[i]);
  }
};

PrimGenerator.prototype.getOptions = function() {
  if (!this.startedYet) {
    // pick a starting room
    return {
      type: "room",
      values: util.range(this.maze.getRoomCount()),
    };
  }
  if (this.transitionVectors.length === 0) return null;
  return {
    type: "vector",
    values: this.transitionVectors,
  };
};
PrimGenerator.prototype.doOption = function(index) {
  if (!this.startedYet) {
    // pick a starting room
    var startingRoom = index;
    this.addRoomToMaze(startingRoom);
    this.startedYet = true;
    return;
  }
  var vector = util.popIndex(this.transitionVectors, index);
  if (!this.includedRooms[vector.room]) {
    // open the door
    this.maze.edgeColors[vector.edge] = Maze.OPEN;
    this.addRoomToMaze(vector.room);
  }
};
