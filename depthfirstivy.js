DepthFirstIvyGenerator.CONSIDERING = "#8888ff";
function DepthFirstIvyGenerator(x, y) {
  this.maze = new Maze(x, y, Maze.OPEN, Maze.OPEN);
  this.isDone = false;

  this.vertexHasBeenVisited = [];
  this.stack = [];

  // pick a random starging point around the borders
  var branches = this.maze.getBorderBranches();
  var startingBranch = branches[Math.floor(Math.random() * branches.length)];
  this.pushBranch(startingBranch);
}

DepthFirstIvyGenerator.prototype.pushBranch = function(branch) {
  this.vertexHasBeenVisited[branch.toVertexScalar] = true;
  this.stack.push(branch);
  this.maze.edgeColors[branch.edge] = DepthFirstIvyGenerator.CONSIDERING;
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
      self.maze.edgeColors[branch.edge] = Maze.FILLED;
    }
    return;
  }
  self.isDone = true;
};
