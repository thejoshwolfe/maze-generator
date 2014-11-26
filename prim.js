util.inherits(PrimGenerator, MazeGenerator);
function PrimGenerator(x, y) {
  MazeGenerator.call(this, x, y, true);
}
PrimGenerator.prototype.step = function() {
  return false;
};
