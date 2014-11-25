
inherits(KruskalGenerator, MazeGenerator);
function KruskalGenerator(x, y) {
  MazeGenerator.call(this, x, y, true);
}
KruskalGenerator.prototype.step = function() {
  var ladder = this.horizontalWalls[Math.floor(Math.random() * this.horizontalWalls.length)];
  ladder[Math.floor(Math.random() * ladder.length)] = false;
  var pole = this.verticalWalls[Math.floor(Math.random() * this.verticalWalls.length)];
  pole[Math.floor(Math.random() * pole.length)] = false;
};

