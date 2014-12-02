DepthFirstIvyGenerator.CONSIDERING = "#8888ff";
function DepthFirstIvyGenerator(x, y) {
  this.maze = new Maze(x, y, Maze.OPEN, Maze.OPEN);
  this.isDone = false;

  this.vertexHasBeenVisited = [];
  this.stack = [];

  // pick a random starging point around the borders
  var startingBranches = [];
  if (this.maze.sizeY > 1) {
    for (var x = 0; x < this.maze.sizeX - 2; x++) {
      startingBranches.push({
        toVertexScalar:this.maze.vertexToScalar(x, 0),
        wall:{wallsArray:this.maze.verticalWallColors, i:x, j:0},
      });
      startingBranches.push({
        toVertexScalar:this.maze.vertexToScalar(x, this.maze.sizeY - 2),
        wall:{wallsArray:this.maze.verticalWallColors, i:x, j:this.maze.sizeY - 1},
      });
    }
  }
  if (this.maze.sizeX > 1) {
    for (var y = 0; y < this.maze.sizeY - 2; y++) {
      startingBranches.push({
        toVertexScalar:this.maze.vertexToScalar(0, y),
        wall:{wallsArray:this.maze.horizontalWallColors, i:0, j:y},
      });
      startingBranches.push({
        toVertexScalar:this.maze.vertexToScalar(this.maze.sizeX - 2, y),
        wall:{wallsArray:this.maze.horizontalWallColors, i:this.maze.sizeX - 1, j:y},
      });
    }
  }
  var startingBranch = util.popRandom(startingBranches);
  this.pushBranch(startingBranch);
}

DepthFirstIvyGenerator.prototype.pushBranch = function(branch) {
  this.vertexHasBeenVisited[branch.toVertexScalar] = true;
  this.stack.push(branch);
  this.maze.setWallColor(branch.wall, DepthFirstIvyGenerator.CONSIDERING);
};

DepthFirstIvyGenerator.prototype.step = function() {
  var self = this;
  while (self.stack.length > 0) {
    var branch = self.stack[self.stack.length - 1];
    var vertex = self.maze.scalarToVertex(branch.toVertexScalar);
    var branches = self.maze.vertexToBranches(vertex.x, vertex.y);
    var availableBranches = branches.filter(function(branch) {
      return !self.vertexHasBeenVisited[branch.toVertexScalar];
    });
    if (availableBranches.length !== 0) {
      var newBranch = util.popRandom(availableBranches);
      this.pushBranch(newBranch);
    } else {
      // pop branch
      self.stack.pop();
      self.maze.setWallColor(branch.wall, Maze.FILLED);
    }
    return;
  }
  self.isDone = true;
};
