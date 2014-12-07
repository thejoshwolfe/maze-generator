function aStarSearch(maze, start, end) {
  var endLocation = maze.getRoomLocation(end);
  var nodeHeap = new Heap(compareNodes);
  var visitedRooms = [];
  var roomCount = maze.getRoomCount();
  for (var i = 0; i < roomCount; i++) {
    visitedRooms.push(false);
  }

  // starting node
  nodeHeap.push({
    room:start,
    parent:null,
    cost:0,
    fitness:heuristic(start),
  });
  visitedRooms[start] = true;

  while (nodeHeap.size() > 0) {
    var fromNode = nodeHeap.pop();
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
      var cost = fromNode.cost + 1;
      nodeHeap.push({
        room:neighborRoom,
        parent:fromNode,
        cost:cost,
        fitness:cost + heuristic(neighborRoom),
      });
      visitedRooms[neighborRoom] = true;
    }
  }
  // impossible
  return null;

  function heuristic(room) {
    // manhattan distance
    var roomLocation = maze.getRoomLocation(room);
    return Math.abs(roomLocation.x - endLocation.x) + Math.abs(roomLocation.y - endLocation.y);
  }
  function compareNodes(a, b) {
    return a.fitness - b.fitness;
  }
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
