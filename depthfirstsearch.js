util.inherits(DepthFirstSearchGenerator, MazeGenerator);
function DepthFirstSearchGenerator(x, y) {
  MazeGenerator.call(this, x, y, MazeGenerator.FILLED, MazeGenerator.FILLED);
}
DepthFirstSearchGenerator.prototype.step = function() {
  return false;
};
