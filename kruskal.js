KruskalGenerator.CONSIDERING = "#aaaaaa";
function KruskalGenerator(topology, sizeX, sizeY) {
  this.maze = new topology(sizeX, sizeY, {
    initialEdgeColor: KruskalGenerator.CONSIDERING,
    initialVertexColor: Maze.FILLED,
  });

  // the order in which we try to delete things
  this.edges = [];
  var edgeCount = this.maze.getEdgeCount();
  for (var i = 0; i < edgeCount; i++) {
    this.edges.push(i);
  }
  util.shuffle(this.edges);
  this.edgesCursor = 0;

  // map from each room to another room connected to it
  this.roomToParentRoom = [];
  var roomCount = this.maze.getRoomCount();
  for (var i = 0; i < roomCount; i++) {
    // initially, everyone is alone
    this.roomToParentRoom[i] = i;
  }
}
KruskalGenerator.prototype.isDone = function() {
  return this.edgesCursor >= this.edges.length;
};
KruskalGenerator.prototype.getParent = function(room) {
  var parent = this.roomToParentRoom[room];
  if (parent === room) return parent;
  var grandParent = this.getParent(parent);
  this.roomToParentRoom[room] = grandParent;
  return grandParent;
};
KruskalGenerator.prototype.mergeRooms = function(room1, room2) {
  var parent1 = this.getParent(room1);
  var parent2 = this.getParent(room2);
  if (parent1 === parent2) return false;
  this.roomToParentRoom[parent2] = parent1;
  return true;
};
KruskalGenerator.prototype.step = function() {
  while (this.edgesCursor < this.edges.length) {
    var edge = this.edges[this.edgesCursor++];
    var roomPair = this.maze.edgeToRoomPair(edge);
    var theMergeHappened = this.mergeRooms(roomPair[0], roomPair[1]);
    if (theMergeHappened) {
      this.maze.edgeColors[edge] = Maze.OPEN;
    } else {
      this.maze.edgeColors[edge] = Maze.FILLED;
    }
    return;
  }
};
