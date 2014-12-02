function IvyGenerator(x, y) {
  this.maze = new Maze(x, y, Maze.OPEN, Maze.OPEN);
  this.isDone = false;

  this.vertexHasBeenVisited = [];
  this.availableBranches = [];

  // start around the borders
  Array.prototype.push.apply(this.availableBranches, this.maze.getBorderBranches());
}

IvyGenerator.prototype.step = function() {
  while (this.availableBranches.length > 0) {
    var branch = util.popRandom(this.availableBranches);
    if (this.vertexHasBeenVisited[branch.toVertexScalar]) continue;
    this.vertexHasBeenVisited[branch.toVertexScalar] = true;
    this.maze.edgeColors[branch.edge] = Maze.FILLED;

    var vertex = this.maze.scalarToVertex(branch.toVertexScalar);
    var branches = this.maze.vertexToBranches(vertex.x, vertex.y);
    Array.prototype.push.apply(this.availableBranches, branches);
    return;
  }
  this.isDone = true;
};
