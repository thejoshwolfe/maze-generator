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

IvyGenerator.prototype.scalarToVertex = function(vertexScalar) {
  var x = Math.floor(vertexScalar / (this.sizeY - 1));
  var y = vertexScalar % (this.sizeY - 1);
  return {x:x, y:y};
};
IvyGenerator.prototype.vertexToScalar = function(x, y) {
  return (this.sizeY - 1) * x + y;
};

IvyGenerator.prototype.step = function() {
  while (true) {
    if (this.availableBranches.length === 0) return false;
    var branch = util.popRandom(this.availableBranches);
    if (this.vertexHasBeenVisited[branch.toVertexScalar]) continue;
    this.vertexHasBeenVisited[branch.toVertexScalar] = true;
    var wall = branch.wall;
    wall.wallsArray[wall.i][wall.j] = MazeGenerator.FILLED;

    var vertex = this.scalarToVertex(branch.toVertexScalar);
    if (vertex.y > 0) {
      this.availableBranches.push({
        toVertexScalar:this.vertexToScalar(vertex.x, vertex.y - 1),
        wall:{wallsArray:this.verticalWallColors, i:vertex.x, j:vertex.y},
      });
    }
    if (vertex.y < this.sizeY - 2) {
      this.availableBranches.push({
        toVertexScalar:this.vertexToScalar(vertex.x, vertex.y + 1),
        wall:{wallsArray:this.verticalWallColors, i:vertex.x, j:vertex.y + 1},
      });
    }
    if (vertex.x > 0) {
      this.availableBranches.push({
        toVertexScalar:this.vertexToScalar(vertex.x - 1, vertex.y),
        wall:{wallsArray:this.horizontalWallColors, i:vertex.x, j:vertex.y},
      });
    }
    if (vertex.x < this.sizeX - 2) {
      this.availableBranches.push({
        toVertexScalar:this.vertexToScalar(vertex.x + 1, vertex.y),
        wall:{wallsArray:this.horizontalWallColors, i:vertex.x + 1, j:vertex.y},
      });
    }
    return true;
  }
};
