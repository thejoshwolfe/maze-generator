
var canvas = window.document.getElementById("canvas");
var stepButton = window.document.getElementById("stepButton");

var sizeX;
var sizeY;
var horizontalWalls;
var verticalWalls;

var cellSize = 10;
var cellSizeHalf = cellSize / 2;


setSize(3, 3);
render();
function setSize(x, y) {
  sizeX = x;
  sizeY = y;
  horizontalWalls = [];
  for (var i = 0; i < x; i++) {
    var ladder = [];
    for (var j = 0; j < y - 1; j++) {
      ladder.push(false);
    }
    horizontalWalls.push(ladder);
  }
  verticalWalls = [];
  for (var i = 0; i < x - 1; i++) {
    var pole = [];
    for (var j = 0; j < y; j++) {
      pole.push(false);
    }
    verticalWalls.push(pole);
  }
}

stepButton.addEventListener("click", function() {
  step();
  render();
});


function step() {
  var ladder = horizontalWalls[Math.floor(Math.random() * horizontalWalls.length)];
  ladder[Math.floor(Math.random() * ladder.length)] = true;
  var pole = verticalWalls[Math.floor(Math.random() * verticalWalls.length)];
  pole[Math.floor(Math.random() * pole.length)] = true;
}

function render() {
  var context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 100, 100);
  context.strokeStyle = "#000000";
  // horizontalWalls
  for (var i = 0; i < sizeX; i++) {
    var ladder = horizontalWalls[i];
    for (var j = -1; j < sizeY - 1 + 1; j++) {
      var drawIt = ladder[j];
      if (drawIt == null || drawIt === true) {
        context.moveTo(i * cellSize + cellSize + cellSizeHalf, j * cellSize + cellSize + cellSizeHalf);
        context.lineTo(i * cellSize + cellSize - cellSizeHalf, j * cellSize + cellSize + cellSizeHalf);
        context.stroke();
      }
    }
  }
  // verticalWalls
  for (var i = -1; i < sizeX - 1 + 1; i++) {
    var pole = verticalWalls[i];
    for (var j = 0; j < sizeY; j++) {
      var drawIt = pole == null || pole[j];
      if (drawIt === true) {
        context.moveTo(i * cellSize + cellSize + cellSizeHalf, j * cellSize + cellSize + cellSizeHalf);
        context.lineTo(i * cellSize + cellSize + cellSizeHalf, j * cellSize + cellSize - cellSizeHalf);
        context.stroke();
      }
    }
  }
}
