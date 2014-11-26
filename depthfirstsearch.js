util.inherits(DepthFirstSearchGenerator, MazeGenerator);
function DepthFirstSearchGenerator(x, y) {
  MazeGenerator.call(this, x, y, true);
}
DepthFirstSearchGenerator.prototype.step = function() {
  return false;
};
