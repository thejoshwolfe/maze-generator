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

  var algorithms = {
    "KruskalGenerator": KruskalGenerator,
    "PrimGenerator": PrimGenerator,
    "DepthFirstSearchGenerator": DepthFirstSearchGenerator,
    "IvyGenerator": IvyGenerator,
  };
  var maze;
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
    canvas.width = maze.getCanvasWidth();
    canvas.height = maze.getCanvasHeight();
    maze.render(canvas);
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

  var animationInterval = null;
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
    maze.render(canvas);
  });
  resetButton.addEventListener("click", function() {
    initGenerator(true);
  });

  shaveButton.addEventListener("click", function() {
    maze.shave();
    maze.render(canvas);
  });

  function step() {
    maze.step();
    maze.render(canvas);
    if (maze.isDone && animationInterval != null) {
      stopIt();
    }
  }
})();
