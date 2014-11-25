
var canvas = window.document.getElementById("canvas");
var stepButton = window.document.getElementById("stepButton");
var goButton = window.document.getElementById("goButton");

function MazeGenerator() {
  this.sizeX = 0;
  this.sizeY = 0;
  this.horizontalWalls = null;
  this.verticalWalls = null;

  this.cellSize = 10;
  this.cellSizeHalf = this.cellSize / 2;
}
MazeGenerator.prototype.setSize = function(x, y) {
  this.sizeX = x;
  this.sizeY = y;
  this.horizontalWalls = [];
  for (var i = 0; i < x; i++) {
    var ladder = [];
    for (var j = 0; j < y - 1; j++) {
      ladder.push(false);
    }
    this.horizontalWalls.push(ladder);
  }
  this.verticalWalls = [];
  for (var i = 0; i < x - 1; i++) {
    var pole = [];
    for (var j = 0; j < y; j++) {
      pole.push(false);
    }
    this.verticalWalls.push(pole);
  }
};
MazeGenerator.prototype.render = function(canvas) {
  var context = canvas.getContext("2d");
  var cellSize = this.cellSize;
  var cellSizeHalf = this.cellSizeHalf;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 100, 100);
  context.strokeStyle = "#000000";
  // horizontalWalls
  for (var i = 0; i < this.sizeX; i++) {
    var ladder = this.horizontalWalls[i];
    for (var j = -1; j < this.sizeY - 1 + 1; j++) {
      var drawIt = ladder[j];
      if (drawIt == null || drawIt === true) {
        context.moveTo(i * cellSize + cellSize + cellSizeHalf, j * cellSize + cellSize + cellSizeHalf);
        context.lineTo(i * cellSize + cellSize - cellSizeHalf, j * cellSize + cellSize + cellSizeHalf);
        context.stroke();
      }
    }
  }
  // verticalWalls
  for (var i = -1; i < this.sizeX - 1 + 1; i++) {
    var pole = this.verticalWalls[i];
    for (var j = 0; j < this.sizeY; j++) {
      var drawIt = pole == null || pole[j];
      if (drawIt === true) {
        context.moveTo(i * cellSize + cellSize + cellSizeHalf, j * cellSize + cellSize + cellSizeHalf);
        context.lineTo(i * cellSize + cellSize + cellSizeHalf, j * cellSize + cellSize - cellSizeHalf);
        context.stroke();
      }
    }
  }
};

inherits(KruskalGenerator, MazeGenerator);
function KruskalGenerator() {
  MazeGenerator.call(this);
}
KruskalGenerator.prototype.step = function() {
  var ladder = this.horizontalWalls[Math.floor(Math.random() * this.horizontalWalls.length)];
  ladder[Math.floor(Math.random() * ladder.length)] = true;
  var pole = this.verticalWalls[Math.floor(Math.random() * this.verticalWalls.length)];
  pole[Math.floor(Math.random() * pole.length)] = true;
};

var generator = new KruskalGenerator();

generator.setSize(5, 5);
generator.render(canvas);


stepButton.addEventListener("click", function() {
  step();
});

var animationInterval = null;
goButton.addEventListener("click", function() {
  if (animationInterval == null) {
    // go
    animationInterval = setInterval(function() {
      step();
    }, 100);
    goButton.textContent = "Stop";
  } else {
    // stop
    clearInterval(animationInterval);
    animationInterval = null;
    goButton.textcontent = "Go";
  }
});


function step() {
  generator.step();
  generator.render(canvas);
}

function inherits(ctor, superCtor) {
  // copied from nodejs's util.js
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
}
