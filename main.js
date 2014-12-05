(function() {
  var algorithmCombobox = window.document.getElementById("algorithmCombobox");
  var sizeXTextbox = window.document.getElementById("sizeXTextbox");
  var sizeYTextbox = window.document.getElementById("sizeYTextbox");

  var mazeCanvas = window.document.getElementById("mazeCanvas");

  var goButton = window.document.getElementById("goButton");
  var stepButton = window.document.getElementById("stepButton");
  var beDoneButton = window.document.getElementById("beDoneButton");
  var resetButton = window.document.getElementById("resetButton");

  var longestPathGoButton = window.document.getElementById("longestPathGoButton");
  var longestPathStepButton = window.document.getElementById("longestPathStepButton");
  var longestPathBeDoneButton = window.document.getElementById("longestPathBeDoneButton");

  var shaveButton = window.document.getElementById("shaveButton");
  var caveInButton = window.document.getElementById("caveInButton");

  var doorsPerRoomCheckbox = window.document.getElementById("doorsPerRoomCheckbox");
  var doorsPerRoomCanvas = window.document.getElementById("doorsPerRoomCanvas");
  var wallsPerVertexCheckbox = window.document.getElementById("wallsPerVertexCheckbox");
  var wallsPerVertexCanvas = window.document.getElementById("wallsPerVertexCanvas");

  var algorithms = {
    "KruskalGenerator": KruskalGenerator,
    "PrimGenerator": PrimGenerator,
    "DepthFirstSearchGenerator": DepthFirstSearchGenerator,
    "IvyGenerator": IvyGenerator,
    "DepthFirstIvyGenerator": DepthFirstIvyGenerator,
  };
  var generator;
  var maze;
  var longestPathFinder;
  var longestPathHighlightMaze;

  var animationInterval = null;
  var wasDone = true;
  var longestPathAnimationInterval = null;

  var pathFinderPoints = [];
  var pathHighlightMaze = null;

  initGenerator();
  function initGenerator(refresh) {
    stopAnimation();
    var algorithmFunction = algorithms[algorithmCombobox.value];
    var sizeX = parseInt(sizeXTextbox.value, 10) || 1;
    var sizeY = parseInt(sizeYTextbox.value, 10) || 1;
    if (!refresh && generator != null) {
      // if nothing's changed, don't reset
      if (generator.constructor === algorithmFunction &&
          maze.sizeX === sizeX &&
          maze.sizeY === sizeY) {
        return;
      }
    }
    generator = new algorithmFunction(sizeX, sizeY);
    maze = generator.maze;
    longestPathFinder = null;
    longestPathHighlightMaze = null;
    pathHighlightMaze = null;
    pathFinderPoints = [];
    mazeCanvas.width = maze.getCanvasWidth();
    mazeCanvas.height = maze.getCanvasHeight();
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

  var mouseIsDown = false;
  mazeCanvas.addEventListener("mousedown", function(event) {
    // only normal left clicking
    if (event.button !== 0) return;
    if (event.shiftKey || event.ctrlKey || event.altKey) return;
    event.preventDefault();
    // this only works on a done maze
    if (!generator.isDone) return;
    var room = maze.getRoomFromPixelLocation(event.offsetX, event.offsetY);
    if (room == null) return;
    pathFinderPoints.push(room);
    if (pathFinderPoints.length > 2) pathFinderPoints.shift();
    // double click to clear
    if (pathFinderPoints.length === 2 && pathFinderPoints[0] === pathFinderPoints[1]) pathFinderPoints = [];
    renderPath();
    mouseIsDown = true;
  });
  // why on the window instead of the canvas? see http://stackoverflow.com/questions/5418740/jquery-mouseup-outside-window-possible/5419564#5419564
  window.addEventListener("mouseup", function() {
    mouseIsDown = false;
  });
  mazeCanvas.addEventListener("mousemove", function(event) {
    // only consider dragging
    if (!mouseIsDown) return;
    // this only works on a done maze
    if (!generator.isDone) return;
    var room = maze.getRoomFromPixelLocation(event.offsetX, event.offsetY);
    if (room == null) return;
    if (pathFinderPoints.length < 2) {
      pathFinderPoints.push(room);
    } else {
      pathFinderPoints[1] = room;
    }
    renderPath();
  });

  function renderPath() {
    if (pathFinderPoints.length === 0) {
      pathHighlightMaze = null;
    } else {
      pathHighlightMaze = new Maze(maze.sizeX, maze.sizeY, Maze.OPEN, Maze.OPEN);
      if (pathFinderPoints.length === 1) {
        pathHighlightMaze.roomColors[pathFinderPoints[0]] = "#ffaaaa";
      } else {
        var path = aStarSearch(maze, pathFinderPoints[0], pathFinderPoints[1]);
        path.forEach(function(room) {
          pathHighlightMaze.roomColors[room] = "#ffaaaa";
        });
      }
    }

    refreshDisplay();
  }

  stepButton.addEventListener("click", function() {
    step();
  });

  goButton.addEventListener("click", function() {
    if (generator.isDone) initGenerator(true);
    if (animationInterval == null) {
      // go
      animationInterval = setInterval(step, 1);
      goButton.textContent = "Stop";
    } else {
      stopAnimation();
    }
  });
  function stopAnimation() {
    if (animationInterval == null) return;
    clearInterval(animationInterval);
    animationInterval = null;
    goButton.textContent = "Go";
  }
  beDoneButton.addEventListener("click", function() {
    stopAnimation();
    if (generator.isDone) initGenerator(true);
    while (!generator.isDone) {
      generator.step();
    }
    refreshDisplay();
  });
  resetButton.addEventListener("click", function() {
    initGenerator(true);
  });

  longestPathGoButton.addEventListener("click", function() {
    if (longestPathAnimationInterval == null) {
      // go
      longestPathAnimationInterval = setInterval(function() {
        longestPathStep();
        refreshDisplay();
      }, 1);
      longestPathGoButton.textContent = "Stop";
    } else {
      longestPathStopAnimation();
    }
  });
  longestPathBeDoneButton.addEventListener("click", function() {
    longestPathStep();
    while (longestPathFinder != null) {
      longestPathStep();
    }
    refreshDisplay();
  });
  longestPathStepButton.addEventListener("click", function() {
    longestPathStep();
    refreshDisplay();
  });
  function longestPathStopAnimation() {
    if (longestPathAnimationInterval == null) return;
    clearInterval(longestPathAnimationInterval);
    longestPathAnimationInterval = null;
    longestPathGoButton.textContent = "Go";
  }
  function longestPathStep() {
    if (longestPathFinder == null) {
      longestPathFinder = new LongestPathFinder(maze);
      longestPathHighlightMaze = longestPathFinder.roomHighlightMaze;
    } else {
      longestPathFinder.step();
    }
    var endPoints = longestPathFinder.getEndPoints();
    if (endPoints == null) return;
    // done
    longestPathStopAnimation();
    longestPathHighlightMaze = new Maze(maze.sizeX, maze.sizeY, Maze.OPEN, Maze.OPEN);
    longestPathHighlightMaze.roomColors[endPoints[0]] = "#ff4444";
    longestPathHighlightMaze.roomColors[endPoints[1]] = "#ff4444";
    longestPathFinder = null;
  }

  shaveButton.addEventListener("click", function() {
    maze.shave();
    refreshDisplay();
  });
  caveInButton.addEventListener("click", function() {
    maze.caveIn();
    refreshDisplay();
  });

  doorsPerRoomCheckbox.addEventListener("click", function() {
    setTimeout(updateStatistics, 0);
  });
  wallsPerVertexCheckbox.addEventListener("click", function() {
    setTimeout(updateStatistics, 0);
  });

  function step() {
    generator.step();
    refreshDisplay();
    if (generator.isDone && animationInterval != null) {
      stopAnimation();
    }
  }

  function refreshDisplay() {
    var context = mazeCanvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, mazeCanvas.width, mazeCanvas.height);
    if (longestPathHighlightMaze != null) {
      longestPathHighlightMaze.render(mazeCanvas);
    }
    if (pathHighlightMaze != null) {
      pathHighlightMaze.render(mazeCanvas);
    }
    maze.render(mazeCanvas);
    var nowDone = generator.isDone;
    if (nowDone !== wasDone) {
      setEnabled(stepButton, !nowDone);
      setEnabled(longestPathGoButton, nowDone);
      setEnabled(longestPathStepButton, nowDone);
      setEnabled(longestPathBeDoneButton, nowDone);
      setEnabled(shaveButton, nowDone);
      setEnabled(caveInButton, nowDone);
    }
    wasDone = nowDone;
    updateStatistics();
  }

  function updateStatistics() {
    var doorsPerRoom = null;
    if (doorsPerRoomCheckbox.checked) {
      doorsPerRoom = [
        {label: "0", values: []},
        {label: "1", values: []},
        {label: "2", values: []},
        {label: "3", values: []},
        {label: "4", values: []},
      ];
      var roomCount = maze.getRoomCount();
      for (var i = 0; i < roomCount; i++) {
        var doorCount = maze.roomToVectors(i).filter(function(vector) {
          return maze.edgeColors[vector.edge] === Maze.OPEN;
        }).length;
        doorsPerRoom[doorCount].values.push(i);
      }
    }
    renderHistogram(doorsPerRoomCanvas, doorsPerRoom);

    var wallsPerVertex = null;
    if (wallsPerVertexCheckbox.checked) {
      wallsPerVertex = [
        {label: "0", values: []},
        {label: "1", values: []},
        {label: "2", values: []},
        {label: "3", values: []},
        {label: "4", values: []},
      ];
      var vertexCount = maze.getVertexCount();
      for (var i = 0; i < vertexCount; i++) {
        var wallCount = maze.vertexToEdges(i).filter(function(edge) {
          return maze.edgeColors[edge] === Maze.FILLED;
        }).length;
        wallsPerVertex[wallCount].values.push(i);
      }
    }
    renderHistogram(wallsPerVertexCanvas, wallsPerVertex);
  }

  function renderHistogram(canvas, data) {
    if (data == null) {
      canvas.width = 0;
      canvas.height = 0;
      return;
    }
    // figure out how big everything's going to be
    var fontHeight = 12;
    var font = fontHeight + "px sans-serif";
    var measuringContext = canvas.getContext("2d");
    measuringContext.font = font;
    // this is a guess. as of writing this,
    // the api to get the height including low-hanging glyphs like "g" are not supported yet
    // (except for ExperimentalCanvasFeatures in chrome).
    var moreRealisticTextHeight = fontHeight * 1.2;
    var maxLabelWidth = 0;
    var longestPossibleBar = 0;
    for (var i = 0; i < data.length; i++) {
      var textMetrics = measuringContext.measureText(data[i].label);
      // it's too bad this TextMetrics object doesn't have a .height property too.
      maxLabelWidth = Math.max(maxLabelWidth, textMetrics.width);
      longestPossibleBar += data[i].values.length;
    }
    var graphWidth = Math.max(300, maxLabelWidth + 200);
    canvas.height = data.length * moreRealisticTextHeight;
    canvas.width = graphWidth;

    // reget the context after resizing the canvas?
    var context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = font;
    context.textBaseline = "top";
    context.textAlign = "right";
    context.strokeStyle = "#000000";
    for (var i = 0; i < data.length; i++) {
      context.strokeText(data[i].label, maxLabelWidth, moreRealisticTextHeight * i);
    }
    var maxBarLength = graphWidth - maxLabelWidth;
    context.fillStyle = "#8888ff";
    context.textAlign = "left";
    for (var i = 0; i < data.length; i++) {
      var barWidth = maxBarLength * data[i].values.length / longestPossibleBar;
      var x = maxLabelWidth;
      var y = moreRealisticTextHeight * i;
      context.fillRect(x, y, barWidth, moreRealisticTextHeight);
      context.strokeText(data[i].values.length, x + 3, y);
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
