function IvyGenerator(x, y) {
  this.maze = new Maze(x, y, Maze.OPEN, Maze.OPEN);
  this.isDone = false;

  this.vertexHasBeenVisited = [];
  this.availableBranches = [];

  // start around the borders
  if (this.maze.sizeY > 1) {
    for (var x = 0; x < this.maze.sizeX - 2; x++) {
      this.availableBranches.push({
        toVertexScalar:this.maze.vertexToScalar(x, 0),
        wall:{wallsArray:this.maze.verticalWallColors, i:x, j:0},
      });
      this.availableBranches.push({
        toVertexScalar:this.maze.vertexToScalar(x, this.maze.sizeY - 2),
        wall:{wallsArray:this.maze.verticalWallColors, i:x, j:this.maze.sizeY - 1},
      });
    }
  }
  if (this.maze.sizeX > 1) {
    for (var y = 0; y < this.maze.sizeY - 2; y++) {
      this.availableBranches.push({
        toVertexScalar:this.maze.vertexToScalar(0, y),
        wall:{wallsArray:this.maze.horizontalWallColors, i:0, j:y},
      });
      this.availableBranches.push({
        toVertexScalar:this.maze.vertexToScalar(this.maze.sizeX - 2, y),
        wall:{wallsArray:this.maze.horizontalWallColors, i:this.maze.sizeX - 1, j:y},
      });
    }
  }
}

IvyGenerator.prototype.step = function() {
  while (this.availableBranches.length > 0) {
    var branch = util.popRandom(this.availableBranches);
    if (this.vertexHasBeenVisited[branch.toVertexScalar]) continue;
    this.vertexHasBeenVisited[branch.toVertexScalar] = true;
    this.maze.setWallColor(branch.wall, Maze.FILLED);

    var vertex = this.maze.scalarToVertex(branch.toVertexScalar);
    var branches = this.maze.vertexToBranches(vertex.x, vertex.y);
    Array.prototype.push.apply(this.availableBranches, branches);
    return;
  }
  this.isDone = true;
};
