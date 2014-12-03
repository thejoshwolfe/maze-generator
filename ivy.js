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
    if (this.vertexHasBeenVisited[branch.vertex]) continue;
    this.vertexHasBeenVisited[branch.vertex] = true;
    this.maze.edgeColors[branch.edge] = Maze.FILLED;

    var branches = this.maze.vertexToBranches(branch.vertex);
    Array.prototype.push.apply(this.availableBranches, branches);
    return;
  }
  this.isDone = true;
};
