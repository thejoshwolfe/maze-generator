(function() {
  var algorithmCombobox = window.document.getElementById("algorithmCombobox");
  var sizeXTextbox = window.document.getElementById("sizeXTextbox");
  var sizeYTextbox = window.document.getElementById("sizeYTextbox");

  var canvas = window.document.getElementById("canvas");

  var stepButton = window.document.getElementById("stepButton");
  var goButton = window.document.getElementById("goButton");
  var beDoneButton = window.document.getElementById("beDoneButton");
  var resetButton = window.document.getElementById("resetButton");

  var shaveButton = window.document.getElementById("shaveButton");

  var doorsPerRoomCheckbox = window.document.getElementById("doorsPerRoomCheckbox");
  var doorsPerRoomSpan = window.document.getElementById("doorsPerRoomSpan");

  var algorithms = {
    "KruskalGenerator": KruskalGenerator,
    "PrimGenerator": PrimGenerator,
    "DepthFirstSearchGenerator": DepthFirstSearchGenerator,
    "IvyGenerator": IvyGenerator,
    "DepthFirstIvyGenerator": DepthFirstIvyGenerator,
  };
  var maze;

  var animationInterval = null;
  var wasDone = false;

  initGenerator();
  function initGenerator(refresh) {
    stopIt();
    var algorithmFunction = algorithms[algorithmCombobox.value];
    var sizeX = parseInt(sizeXTextbox.value, 10) || 1;
    var sizeY = parseInt(sizeYTextbox.value, 10) || 1;
    if (!refresh && maze != null) {
      // if nothing's changed, don't reset
      if (maze.constructor === algorithmFunction &&
          maze.sizeX === sizeX &&
          maze.sizeY === sizeY) {
        return;
      }
    }
    maze = new algorithmFunction(sizeX, sizeY);
    wasDone = false;
    canvas.width = maze.getCanvasWidth();
    canvas.height = maze.getCanvasHeight();
    refreshDisplay();
  }

  algorithmCombobox.addEventListener("change", function() {
    setTimeout(initGenerator, 0);
  });
  sizeXTextbox.addEventListener("keydown", function() {
    setTimeout(initGenerator, 0);
  });
  sizeYTextbox.addEventListener("keydown", function() {
    setTimeout(initGenerator, 0);
  });

  stepButton.addEventListener("click", function() {
    step();
  });

  goButton.addEventListener("click", function() {
    if (maze.isDone) initGenerator(true);
    if (animationInterval == null) {
      // go
      animationInterval = setInterval(function() {
        step();
      }, 1);
      goButton.textContent = "Stop";
    } else {
      stopIt();
    }
  });
  function stopIt() {
    if (animationInterval == null) return;
    clearInterval(animationInterval);
    animationInterval = null;
    goButton.textContent = "Go";
  }
  beDoneButton.addEventListener("click", function() {
    stopIt();
    if (maze.isDone) initGenerator(true);
    while (!maze.isDone) {
      maze.step();
    }
    refreshDisplay();
  });
  resetButton.addEventListener("click", function() {
    initGenerator(true);
  });

  shaveButton.addEventListener("click", function() {
    maze.shave();
    refreshDisplay();
  });

  doorsPerRoomCheckbox.addEventListener("click", function() {
    setTimeout(updateStatistics, 0);
  });

  function step() {
    maze.step();
    refreshDisplay();
    if (maze.isDone && animationInterval != null) {
      stopIt();
    }
  }

  function refreshDisplay() {
    maze.render(canvas);
    var nowDone = maze.isDone;
    if (nowDone !== wasDone) {
      setEnabled(stepButton, !nowDone);
      setEnabled(shaveButton, nowDone);
    }
    wasDone = nowDone;
    updateStatistics();
  }

  function updateStatistics() {
    if (doorsPerRoomCheckbox.checked && maze.isDone) {
      var doorsPerRoom = {1:0, 2:0, 3:0, 4:0};
      var roomCount = maze.getRoomCount();
      for (var i = 0; i < roomCount; i++) {
        var room = maze.scalarToRoom(i);
        var doorCount = maze.roomToVectors(room.x, room.y).filter(function(vector) {
          return maze.getWallColor(vector.wall) === MazeGenerator.OPEN;
        }).length;
        doorsPerRoom[doorCount]++;
      }
      doorsPerRoomSpan.textContent = JSON.stringify(doorsPerRoom);
    } else {
      doorsPerRoomSpan.textContent = "";
    }
  }

  function setEnabled(button, value) {
    if (value) {
      button.removeAttribute("disabled");
    } else {
      button.setAttribute("disabled", "");
    }
  }
})();
