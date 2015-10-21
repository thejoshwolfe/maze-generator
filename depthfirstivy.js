DepthFirstIvyGenerator.CONSIDERING = "#8888ff";
function DepthFirstIvyGenerator(topology, sizeX, sizeY) {
  this.maze = new Maze(topology, sizeX, sizeY);

  this.vertexHasBeenVisited = [];
  this.stack = [];
  this.availableBranches = null;

  this.startedYet = false;
  this.startingBranches = null;
}

DepthFirstIvyGenerator.prototype.pushBranch = function(branch) {
  this.vertexHasBeenVisited[branch.vertex] = true;
  this.stack.push(branch);
  this.maze.vertexColors[branch.vertex] = DepthFirstIvyGenerator.CONSIDERING;
  this.maze.edgeColors[branch.edge] = DepthFirstIvyGenerator.CONSIDERING;
};

DepthFirstIvyGenerator.prototype.getOptions = function() {
  var self = this;
  if (!self.startedYet) {
    // start on the border
    self.startingBranches = self.maze.getBorderBranches();
    if (self.startingBranches.length === 0) {
      // start at any vertex
      self.startingBranches = [];
      var vertexCount = self.maze.getVertexCount();
      for (var i = 0; i < vertexCount; i++) {
        // start facing any direction
        Array.prototype.push.apply(self.startingBranches, self.maze.vertexToBranches(i));
      }
    }
    if (self.startingBranches.length === 0) {
      // this maze sucks
      return null;
    }
    return {
      type: "branch",
      values: self.startingBranches,
    };
  }

  if (self.stack.length === 0) return null;

  var branch = self.stack[self.stack.length - 1];
  var branches = self.maze.vertexToBranches(branch.vertex);
  self.availableBranches = branches.filter(function(branch) {
    return !self.vertexHasBeenVisited[branch.vertex];
  });
  return {
    type: "branch",
    values: self.availableBranches,
  };
};
DepthFirstIvyGenerator.prototype.doOption = function(index) {
  if (!this.startedYet) {
    var startingBranch = this.startingBranches[index];
    this.pushBranch(startingBranch);
    // TODO: if we started in the middle, mark the starting vertex as visited
    this.startedYet = true;
    this.startingBranches = null;
    return;
  }
  if (this.availableBranches.length !== 0) {
    var newBranch = this.availableBranches[index];
    this.pushBranch(newBranch);
  } else {
    // backtrack
    var branch = this.stack.pop();
    this.maze.vertexColors[branch.vertex] = Maze.FILLED;
    this.maze.edgeColors[branch.edge] = Maze.FILLED;
  }
};
