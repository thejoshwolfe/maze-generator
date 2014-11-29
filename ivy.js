util.inherits(IvyGenerator, MazeGenerator);
function IvyGenerator(x, y) {
  MazeGenerator.call(this, x, y, MazeGenerator.OPEN, MazeGenerator.OPEN);

  this.vertexHasBeenVisited = [];
  this.availableBranches = [];

  // start around the borders
  if (this.sizeY > 1) {
    for (var x = 0; x < this.sizeX - 2; x++) {
      this.availableBranches.push({
        toVertexScalar:this.vertexToScalar(x, 0),
        wall:{wallsArray:this.verticalWallColors, i:x, j:0},
      });
      this.availableBranches.push({
        toVertexScalar:this.vertexToScalar(x, this.sizeY - 2),
        wall:{wallsArray:this.verticalWallColors, i:x, j:this.sizeY - 1},
      });
    }
  }
  if (this.sizeX > 1) {
    for (var y = 0; y < this.sizeY - 2; y++) {
      this.availableBranches.push({
        toVertexScalar:this.vertexToScalar(0, y),
        wall:{wallsArray:this.horizontalWallColors, i:0, j:y},
      });
      this.availableBranches.push({
        toVertexScalar:this.vertexToScalar(this.sizeX - 2, y),
        wall:{wallsArray:this.horizontalWallColors, i:this.sizeX - 1, j:y},
      });
    }
  }
}

IvyGenerator.prototype.step = function() {
  while (this.availableBranches.length > 0) {
    var branch = util.popRandom(this.availableBranches);
    if (this.vertexHasBeenVisited[branch.toVertexScalar]) continue;
    this.vertexHasBeenVisited[branch.toVertexScalar] = true;
    this.colorWall(branch.wall, MazeGenerator.FILLED);

    var vertex = this.scalarToVertex(branch.toVertexScalar);
    var branches = this.vertexToBranches(vertex.x, vertex.y);
    Array.prototype.push.apply(this.availableBranches, branches);
    return;
  }
  this.isDone = true;
};
