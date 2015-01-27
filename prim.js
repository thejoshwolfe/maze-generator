function PrimGenerator(topology, sizeX, sizeY) {
  this.maze = new topology(sizeX, sizeY, {
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

  // pick a starting room
  var startingRoom = Math.floor(Math.random() * this.maze.getRoomCount());
  this.addRoomToMaze(startingRoom);
}
PrimGenerator.prototype.isDone = function() {
  return this.transitionVectors.length === 0;
};

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

PrimGenerator.prototype.step = function() {
  while (this.transitionVectors.length > 0) {
    var vector = util.popRandom(this.transitionVectors);
    if (this.includedRooms[vector.room]) continue;
    // open the door
    this.maze.edgeColors[vector.edge] = Maze.OPEN;
    this.addRoomToMaze(vector.room);
    return;
  }
};
