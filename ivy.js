function IvyGenerator(topology, sizeX, sizeY) {
  this.maze = new topology(sizeX, sizeY);

  this.vertexHasBeenVisited = [];
  this.availableBranches = [];

  // start around the borders
  Array.prototype.push.apply(this.availableBranches, this.maze.getBorderBranches());
  if (this.availableBranches.length === 0) {
    // some topologies don't have borders
    // start in a random spot
    var vertexCount = this.maze.getVertexCount();
    if (vertexCount > 0) {
      var startingVertex = util.randomInt(vertexCount);
      this.visitVertex(startingVertex);
    }
  }
}
IvyGenerator.prototype.isDone = function() {
  return this.availableBranches.length === 0;
};
IvyGenerator.prototype.visitVertex = function(vertex) {
  this.vertexHasBeenVisited[vertex] = true;
  this.maze.vertexColors[vertex] = Maze.FILLED;
  var branches = this.maze.vertexToBranches(vertex);
  Array.prototype.push.apply(this.availableBranches, branches);
};

IvyGenerator.prototype.step = function() {
  while (this.availableBranches.length > 0) {
    var branch = util.popRandom(this.availableBranches);
    if (this.vertexHasBeenVisited[branch.vertex]) continue;
    this.maze.edgeColors[branch.edge] = Maze.FILLED;
    this.visitVertex(branch.vertex);
    return;
  }
};
