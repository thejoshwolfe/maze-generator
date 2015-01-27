
LongestPathFinder.CANDIDATE_PATH = "#aaaaff";
LongestPathFinder.FAILURE = "#888888";
function LongestPathFinder(maze) {
  this.maze = maze;
  this.roomHighlightMaze = new Maze(maze.sizeX, maze.sizeY, Maze.OPEN, Maze.OPEN);

  this.traversals = [];
  var roomCount = maze.getRoomCount();
  for (var i = 0; i < roomCount; i++) {
    var vectors = maze.roomToVectors(i).filter(function(vector) {
      return maze.edgeColors[vector.edge] === Maze.OPEN;
    });
    if (vectors.length === 1) {
      var fromRoom = i;
      var throughEdge = vectors[0].edge;
      var toRoom = vectors[0].room;
      this.traversals.push([fromRoom, throughEdge, toRoom]);
      this.roomHighlightMaze.roomColors[fromRoom] = LongestPathFinder.CANDIDATE_PATH;
    }
  }
}

LongestPathFinder.NOT_DONE_YET = "NOT_DONE_YET";
LongestPathFinder.IMPOSSIBLE = "IMPOSSIBLE";
LongestPathFinder.prototype.getEndPoints = function() {
  if (this.traversals.length === 2) {
    // we know the end points
    var path = this.traversals[0];
    if (this.roomHighlightMaze.roomColors[path[path.length - 1]] === Maze.OPEN) {
      // they haven't met yet
      return LongestPathFinder.NOT_DONE_YET;
    }
    return [path[0], this.traversals[1][0]];
  }
  if (this.traversals.length > 0) {
    // stuff is still going on
    return LongestPathFinder.NOT_DONE_YET;
  }
  // 0 traversals? something's gone wrong
  return LongestPathFinder.IMPOSSIBLE;
};

LongestPathFinder.prototype.step = function() {
  var self = this;
  for (var i = self.traversals.length - 1; i >= 0; i--) {
    var path = self.traversals[i];
    var backwards = path[path.length - 3];
    var backwardsEdge = path[path.length - 2];
    var fromRoom = path[path.length - 1];
    var openVectors = self.maze.roomToVectors(fromRoom).filter(function(vector) {
      if (vector.room === backwards) return false;
      if (self.maze.edgeColors[vector.edge] !== Maze.OPEN) return false;
      var roomHighlight = self.roomHighlightMaze.roomColors[vector.room];
      if (roomHighlight === LongestPathFinder.FAILURE) return false;
      return true;
    });
    if (openVectors.length === 1) {
      // advance
      var throughEdge = openVectors[0].edge;
      var toRoom = openVectors[0].room;
      path.push(throughEdge);
      path.push(toRoom);
      self.roomHighlightMaze.edgeColors[backwardsEdge] = LongestPathFinder.CANDIDATE_PATH;
      self.roomHighlightMaze.roomColors[fromRoom] = LongestPathFinder.CANDIDATE_PATH;
    } else {
      // die
      path.pop(); // foward room
      while (path.length > 0) {
        var fowardEdge = path.pop();
        self.roomHighlightMaze.edgeColors[fowardEdge] = LongestPathFinder.FAILURE;
        var room = path.pop();
        self.roomHighlightMaze.roomColors[room] = LongestPathFinder.FAILURE;
      }
      self.traversals.splice(i, 1);
    }
  }
};
