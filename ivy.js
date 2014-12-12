function IvyGenerator(topology, sizeX, sizeY) {
  this.maze = new topology(sizeX, sizeY, Maze.OPEN, Maze.OPEN);

  this.vertexHasBeenVisited = [];
  this.availableBranches = [];

  // start around the borders
  Array.prototype.push.apply(this.availableBranches, this.maze.getBorderBranches());
}
IvyGenerator.prototype.isDone = function() {
  return this.availableBranches.length === 0;
};

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
};
