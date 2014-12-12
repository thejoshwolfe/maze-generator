DepthFirstIvyGenerator.CONSIDERING = "#8888ff";
function DepthFirstIvyGenerator(topology, sizeX, sizeY) {
  this.maze = new topology(sizeX, sizeY, Maze.OPEN, Maze.OPEN);

  this.vertexHasBeenVisited = [];
  this.stack = [];

  // pick a random starging point around the borders
  var branches = this.maze.getBorderBranches();
  if (branches.length > 0) {
    var startingBranch = branches[util.randomInt(branches.length)];
    this.pushBranch(startingBranch);
  } else {
    // start at a random vertex
    var vertexCount = this.maze.getVertexCount();
    if (vertexCount !== 0) {
      var startingVertex = util.randomInt(vertexCount);
      this.vertexHasBeenVisited[startingVertex] = true;
      var branches = this.maze.vertexToBranches(startingVertex);
      var startingBranch = branches[util.randomInt(branches.length)];
      this.pushBranch(startingBranch);
    }
  }
}
DepthFirstIvyGenerator.prototype.isDone = function() {
  return this.stack.length === 0;
};

DepthFirstIvyGenerator.prototype.pushBranch = function(branch) {
  this.vertexHasBeenVisited[branch.vertex] = true;
  this.stack.push(branch);
  this.maze.edgeColors[branch.edge] = DepthFirstIvyGenerator.CONSIDERING;
};

DepthFirstIvyGenerator.prototype.step = function() {
  var self = this;
  while (self.stack.length > 0) {
    var branch = self.stack[self.stack.length - 1];
    var branches = self.maze.vertexToBranches(branch.vertex);
    var availableBranches = branches.filter(function(branch) {
      return !self.vertexHasBeenVisited[branch.vertex];
    });
    if (availableBranches.length !== 0) {
      var newBranch = util.popRandom(availableBranches);
      this.pushBranch(newBranch);
    } else {
      // pop branch
      self.stack.pop();
      self.maze.edgeColors[branch.edge] = Maze.FILLED;
    }
    return;
  }
};
