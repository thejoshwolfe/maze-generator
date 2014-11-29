util.inherits(KruskalGenerator, MazeGenerator);

KruskalGenerator.CONSIDERING = "#aaaaaa";
function KruskalGenerator(x, y) {
  MazeGenerator.call(this, x, y, KruskalGenerator.CONSIDERING, MazeGenerator.OPEN);

  // the order in which we try to delete things
  this.edges = [];
  var wallCount = this.getWallCount();
  for (var i = 0; i < wallCount; i++) {
    this.edges.push(i);
  }
  util.shuffle(this.edges);
  this.edgesCursor = 0;

  // map from each room to another room connected to it
  this.roomToParentRoom = [];
  var roomCount = this.getRoomCount();
  for (var i = 0; i < roomCount; i++) {
    // initially, everyone is alone
    this.roomToParentRoom[i] = i;
  }
}
KruskalGenerator.prototype.wallToRoomScalarPair = function(wall) {
  var result = [];
  var x = wall.i;
  var y = wall.j;
  result.push(this.roomToScalar(x, y));
  if (wall.wallsArray === this.horizontalWallColors) {
    // horizontalWallColors
    y += 1;
  } else {
    // verticalWallColors
    x += 1;
  }
  result.push(this.roomToScalar(x, y));
  return result;
};
KruskalGenerator.prototype.getParent = function(roomScalar) {
  var parent = this.roomToParentRoom[roomScalar];
  if (parent === roomScalar) return parent;
  var grandParent = this.getParent(parent);
  this.roomToParentRoom[roomScalar] = grandParent;
  return grandParent;
};
KruskalGenerator.prototype.mergeRooms = function(roomScalar1, roomScalar2) {
  var parent1 = this.getParent(roomScalar1);
  var parent2 = this.getParent(roomScalar2);
  if (parent1 === parent2) return false;
  this.roomToParentRoom[parent2] = parent1;
  return true;
};
KruskalGenerator.prototype.step = function() {
  while (this.edgesCursor < this.edges.length) {
    var edge = this.edges[this.edgesCursor++];
    var wall = this.scalarToWall(edge);
    var roomPair = this.wallToRoomScalarPair(wall);
    var theMergeHappened = this.mergeRooms(roomPair[0], roomPair[1]);
    if (theMergeHappened) {
      wall.wallsArray[wall.i][wall.j] = MazeGenerator.OPEN;
    } else {
      wall.wallsArray[wall.i][wall.j] = MazeGenerator.FILLED;
    }
    return;
  }
  this.isDone = true;
};
