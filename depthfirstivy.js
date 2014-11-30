util.inherits(DepthFirstIvyGenerator, MazeGenerator);
DepthFirstIvyGenerator.CONSIDERING = "#8888ff";
function DepthFirstIvyGenerator(x, y) {
  MazeGenerator.call(this, x, y, MazeGenerator.OPEN, MazeGenerator.OPEN);

  this.vertexHasBeenVisited = [];
  this.stack = [];

  // pick a random starging point around the borders
  var startingBranches = [];
  if (this.sizeY > 1) {
    for (var x = 0; x < this.sizeX - 2; x++) {
      startingBranches.push({
        toVertexScalar:this.vertexToScalar(x, 0),
        wall:{wallsArray:this.verticalWallColors, i:x, j:0},
      });
      startingBranches.push({
        toVertexScalar:this.vertexToScalar(x, this.sizeY - 2),
        wall:{wallsArray:this.verticalWallColors, i:x, j:this.sizeY - 1},
      });
    }
  }
  if (this.sizeX > 1) {
    for (var y = 0; y < this.sizeY - 2; y++) {
      startingBranches.push({
        toVertexScalar:this.vertexToScalar(0, y),
        wall:{wallsArray:this.horizontalWallColors, i:0, j:y},
      });
      startingBranches.push({
        toVertexScalar:this.vertexToScalar(this.sizeX - 2, y),
        wall:{wallsArray:this.horizontalWallColors, i:this.sizeX - 1, j:y},
      });
    }
  }
  var startingBranch = util.popRandom(startingBranches);
  this.pushBranch(startingBranch);
}

DepthFirstIvyGenerator.prototype.pushBranch = function(branch) {
  this.vertexHasBeenVisited[branch.toVertexScalar] = true;
  this.stack.push(branch);
  this.setWallColor(branch.wall, DepthFirstIvyGenerator.CONSIDERING);
};

DepthFirstIvyGenerator.prototype.step = function() {
  var self = this;
  while (self.stack.length > 0) {
    var branch = self.stack[self.stack.length - 1];
    var vertex = self.scalarToVertex(branch.toVertexScalar);
    var branches = self.vertexToBranches(vertex.x, vertex.y);
    var availableBranches = branches.filter(function(branch) {
      return !self.vertexHasBeenVisited[branch.toVertexScalar];
    });
    if (availableBranches.length !== 0) {
      var newBranch = util.popRandom(availableBranches);
      this.pushBranch(newBranch);
    } else {
      // pop branch
      self.stack.pop();
      self.setWallColor(branch.wall, MazeGenerator.FILLED);
    }
    return;
  }
  self.isDone = true;
};
