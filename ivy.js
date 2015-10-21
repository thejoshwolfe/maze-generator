function IvyGenerator(topology, sizeX, sizeY) {
  this.maze = new Maze(topology, sizeX, sizeY);

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
IvyGenerator.prototype.visitVertex = function(vertex) {
  this.vertexHasBeenVisited[vertex] = true;
  this.maze.vertexColors[vertex] = Maze.FILLED;
  var branches = this.maze.vertexToBranches(vertex);
  Array.prototype.push.apply(this.availableBranches, branches);
};

IvyGenerator.prototype.getOptions = function() {
  if (this.availableBranches.length === 0) return null;
  return {
    type: "branch",
    values: this.availableBranches,
  };
};
IvyGenerator.prototype.doOption = function(index) {
  var branch = util.popIndex(this.availableBranches, index);
  if (!this.vertexHasBeenVisited[branch.vertex]) {
    this.maze.edgeColors[branch.edge] = Maze.FILLED;
    this.visitVertex(branch.vertex);
  }
};
