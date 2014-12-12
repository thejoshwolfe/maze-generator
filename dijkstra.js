function dijkstraSearch(maze, start, end) {
  var endLocation = maze.getRoomLocation(end);
  var nodeQueue = [];
  var visitedRooms = [];
  var roomCount = maze.getRoomCount();
  for (var i = 0; i < roomCount; i++) {
    visitedRooms.push(false);
  }

  // starting node
  nodeQueue.push({
    room:start,
    parent:null,
  });
  visitedRooms[start] = true;

  while (nodeQueue.length > 0) {
    var fromNode = nodeQueue.shift();
    if (fromNode.room === end) {
      // success
      return reconstructPath(fromNode);
    }
    var vectors = maze.roomToVectors(fromNode.room).filter(function(vector) {
      if (maze.edgeColors[vector.edge] !== Maze.OPEN) return false;
      if (visitedRooms[vector.room]) return false;
      return true;
    });
    for (var i = 0; i < vectors.length; i++) {
      var neighborRoom = vectors[i].room;
      nodeQueue.push({
        room:neighborRoom,
        parent:fromNode,
      });
      visitedRooms[neighborRoom] = true;
    }
  }
  // impossible
  return null;

  function reconstructPath(node) {
    var path = [];
    while (node != null) {
      path.push(node.room);
      node = node.parent;
    }
    path.reverse();
    return path;
  }
}
